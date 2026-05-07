export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const WHATSAPP_NUMBER = '+923008647649' // Replace with real number
export const WHATSAPP_MESSAGE = encodeURIComponent(
  'السلام علیکم! I need help with my order on Kapra Store.'
)

export const FABRIC_TYPES = [
  { value: 'lawn', label: 'Lawn' },
  { value: 'khaddar', label: 'Khaddar' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'chiffon', label: 'Chiffon' },
  { value: 'silk', label: 'Silk' },
  { value: 'organza', label: 'Organza' },
  { value: 'linen', label: 'Linen' }
]

export const OCCASIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'bridal', label: 'Bridal' },
  { value: 'eid', label: 'Eid' },
  { value: 'party', label: 'Party' },
  { value: 'everyday', label: 'Everyday' }
]

export const YARDAGES = [
  { value: '2.5', label: '2.5 Meters' },
  { value: '3', label: '3 Meters' },
  { value: '3.5', label: '3.5 Meters' }
]

export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name A → Z' }
]

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  packed: { label: 'Packed', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-800' }
}

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad'
]

export const FREE_SHIPPING_THRESHOLD = 2999
export const FLAT_SHIPPING_FEE = 200
