import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendEmail } from '../utils/sendEmail.js'
import { orderStatusUpdateEmail } from '../utils/orderEmail.js'

// ─────────────────────────────────────────────────────────
// GET /api/admin/dashboard — KPI Stats
// ─────────────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date()
  const startOfDay = new Date(now.setHours(0, 0, 0, 0))

  // Run all aggregations in parallel for speed
  const [
    totalOrders,
    todayOrders,
    totalRevenue,
    todayRevenue,
    totalUsers,
    newUsersToday,
    totalProducts,
    lowStockProducts,
    ordersByStatus,
    revenueByDay,
    topProducts
  ] = await Promise.all([
    // Total order count
    Order.countDocuments(),

    // Orders placed today
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),

    // Total revenue (delivered orders only)
    Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),

    // Today's revenue
    Order.aggregate([
      {
        $match: {
          orderStatus: 'delivered',
          createdAt: { $gte: startOfDay }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),

    // Total registered users
    User.countDocuments({ role: 'user' }),

    // New users today
    User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfDay }
    }),

    // Total active products
    Product.countDocuments({ isActive: true }),

    // Low stock (≤ 5 units)
    Product.find({ isActive: true, stock: { $lte: 5 } })
      .select('name stock fabricType images')
      .limit(10)
      .lean(),

    // Orders grouped by status
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Revenue last 7 days (for mini chart)
    Order.aggregate([
      {
        $match: {
          orderStatus: 'delivered',
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Top 5 selling products by quantity
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ])
  ])

  res.json({
    overview: {
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      todayRevenue: todayRevenue[0]?.total ?? 0,
      totalUsers,
      newUsersToday,
      totalProducts,
      lowStockCount: lowStockProducts.length
    },
    ordersByStatus: ordersByStatus.reduce(
      (acc, { _id, count }) => ({ ...acc, [_id]: count }),
      {}
    ),
    revenueByDay,
    topProducts,
    lowStockProducts
  })
})

// ─────────────────────────────────────────────────────────
// GET /api/admin/orders — All orders with filters
// ─────────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    payment,
    search, // Search by orderId or customer name
    startDate,
    endDate,
    sort = 'createdAt_desc'
  } = req.query

  const filter = {}

  if (status) filter.orderStatus = status
  if (payment) filter.paymentMethod = payment

  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = end
    }
  }

  if (search) {
    filter.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'guestInfo.name': { $regex: search, $options: 'i' } },
      { 'guestInfo.phone': { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
    ]
  }

  const sortMap = {
    createdAt_desc: { createdAt: -1 },
    createdAt_asc: { createdAt: 1 },
    total_desc: { total: -1 },
    total_asc: { total: 1 }
  }

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Order.countDocuments(filter)

  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort(sortMap[sort] ?? { createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  res.json({
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  })
})

// ─────────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/status — Update order status
// ─────────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body

  const validStatuses = [
    'pending',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
  ]

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    })
  }

  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  if (!order) return res.status(404).json({ message: 'Order not found' })

  // Prevent going backward in status (except to cancelled)
  const statusOrder = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
  const currentIdx = statusOrder.indexOf(order.orderStatus)
  const newIdx = statusOrder.indexOf(status)

  if (status !== 'cancelled' && status !== 'returned' && newIdx < currentIdx) {
    return res.status(400).json({
      message: `Cannot revert status from "${order.orderStatus}" to "${status}"`
    })
  }

  const previousStatus = order.orderStatus
  order.orderStatus = status

  if (trackingNumber) order.trackingNumber = trackingNumber

  // Auto-update payment status for delivered COD orders
  if (status === 'delivered' && order.paymentMethod === 'COD') {
    order.paymentStatus = 'paid'
  }

  // Restore stock on cancellation
  if (status === 'cancelled' && previousStatus !== 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      })
    }
  }

  // Handle return approval — restore stock
  if (status === 'returned' && order.returnRequest?.requested) {
    order.returnRequest.status = 'approved'
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      })
    }
  }

  await order.save()

  // Send status update email if user exists
  const emailAddress = order.user?.email ?? order.guestInfo?.email
  if (emailAddress) {
    sendEmail({
      to: emailAddress,
      subject: `Order ${order.orderId} — Status Updated to ${status}`,
      html: orderStatusUpdateEmail(order, status)
    }).catch(() => {})
  }

  res.json({
    message: `Order status updated to "${status}"`,
    order: {
      _id: order._id,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber
    }
  })
})

// ─────────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/return — Approve or reject return
// ─────────────────────────────────────────────────────────
export const handleReturnRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body // "approved" | "rejected"

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({
      message: 'decision must be "approved" or "rejected"'
    })
  }

  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (!order.returnRequest?.requested) {
    return res.status(400).json({ message: 'No return request on this order' })
  }

  order.returnRequest.status = decision

  if (decision === 'approved') {
    order.orderStatus = 'returned'
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      })
    }
  }

  await order.save()
  res.json({ message: `Return request ${decision}`, order })
})

// ─────────────────────────────────────────────────────────
// GET /api/admin/users — All users (paginated)
// ─────────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role = 'user' } = req.query

  const filter = { role }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const total = await User.countDocuments(filter)

  const users = await User.find(filter)
    .select('-passwordHash -otp -otpExpiry -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  // Attach order count per user
  const usersWithOrders = await Promise.all(
    users.map(async (user) => {
      const [orderCount, totalSpent] = await Promise.all([
        Order.countDocuments({ user: user._id }),
        Order.aggregate([
          { $match: { user: user._id, orderStatus: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
      ])
      return {
        ...user,
        orderCount,
        totalSpent: totalSpent[0]?.total ?? 0
      }
    })
  )

  res.json({
    users: usersWithOrders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  })
})

// ─────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/role — Promote / demote user
// ─────────────────────────────────────────────────────────
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'role must be user or admin' })
  }

  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot change your own role' })
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-passwordHash -otp')

  if (!user) return res.status(404).json({ message: 'User not found' })

  res.json({ message: `User role updated to ${role}`, user })
})

// ─────────────────────────────────────────────────────────
// GET /api/admin/products — Products list with stock alerts
// ─────────────────────────────────────────────────────────
export const getAdminProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    fabricType,
    stock, // "low" | "out"
    isActive
  } = req.query

  const filter = {}

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ]
  }

  if (category) filter.category = category
  if (fabricType) filter.fabricType = fabricType

  if (stock === 'low') filter.stock = { $gt: 0, $lte: 5 }
  if (stock === 'out') filter.stock = 0

  if (isActive !== undefined) filter.isActive = isActive === 'true'

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Product.countDocuments(filter)

  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  res.json({
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  })
})
