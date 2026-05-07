export const orderConfirmationEmail = (order, userName) => {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #f3f4f6;">
          ${item.name}
        </td>
        <td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:center;">
          ${item.qty}
        </td>
        <td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;">
          Rs. ${(item.price * item.qty).toLocaleString()}
        </td>
      </tr>`
    )
    .join('')

  return `
  <div style="font-family:Poppins,sans-serif;max-width:560px;margin:auto;
              padding:24px;border:1px solid #e5e7eb;border-radius:12px;">

    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#b45309;margin:0;">Kapra Store</h1>
      <p style="color:#6b7280;margin:4px 0 0;">کپڑا اسٹور</p>
    </div>

    <h2 style="color:#1f2937;">🎉 Order Confirmed!</h2>
    <p>Hi <strong>${userName}</strong>, your order has been placed successfully.</p>

    <div style="background:#fef9f0;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#6b7280;">Order ID</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#b45309;">
        ${order.orderId}
      </p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px;text-align:left;font-size:13px;">Product</th>
          <th style="padding:10px;text-align:center;font-size:13px;">Qty</th>
          <th style="padding:10px;text-align:right;font-size:13px;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>

    <div style="border-top:2px solid #f3f4f6;padding-top:12px;margin-top:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#6b7280;">Subtotal</span>
        <span>Rs. ${order.subtotal.toLocaleString()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#6b7280;">Shipping</span>
        <span>${order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee}`}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;
                  font-size:18px;color:#b45309;margin-top:8px;">
        <span>Total</span>
        <span>Rs. ${order.total.toLocaleString()}</span>
      </div>
    </div>

    <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#6b7280;">Payment Method</p>
      <p style="margin:4px 0 0;font-weight:600;color:#166534;">
        ${
          order.paymentMethod === 'COD'
            ? '💵 Cash on Delivery (COD)'
            : order.paymentMethod
        }
      </p>
    </div>

    <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:600;">📦 Shipping To:</p>
      <p style="margin:0;color:#374151;line-height:1.6;">
        ${order.shippingAddress.fullName}<br/>
        ${order.shippingAddress.street}<br/>
        ${order.shippingAddress.city}
        ${order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ''}
      </p>
    </div>

    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;">
        📞 Need help? WhatsApp us or call <strong>03XX-XXXXXXX</strong><br/>
        🔄 Easy 7-day returns | 🚚 Delivery in 3-7 business days
      </p>
    </div>

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:24px;">
      Track your order at kaprastore.com/track-order using ID: ${order.orderId}
    </p>
  </div>`
}

export const orderStatusUpdateEmail = (order, newStatus) => {
  const statusMessages = {
    confirmed: {
      emoji: '✅',
      text: 'Your order has been confirmed and is being prepared.'
    },
    packed: {
      emoji: '📦',
      text: 'Your order is packed and ready to be handed to the courier.'
    },
    shipped: {
      emoji: '🚚',
      text: 'Your order is on its way! Expected delivery in 2-4 days.'
    },
    delivered: {
      emoji: '🎉',
      text: 'Your order has been delivered. Enjoy your fabric!'
    },
    cancelled: {
      emoji: '❌',
      text: 'Your order has been cancelled. Contact us if this is a mistake.'
    },
    returned: { emoji: '🔄', text: 'Your return request has been processed.' }
  }

  const { emoji, text } = statusMessages[newStatus] || {
    emoji: '📋',
    text: `Your order status has been updated to: ${newStatus}`
  }

  return `
  <div style="font-family:Poppins,sans-serif;max-width:480px;margin:auto;
              padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
    <h2 style="color:#b45309;">Kapra Store — Order Update</h2>
    <h1 style="font-size:40px;margin:16px 0;">${emoji}</h1>
    <h3>Order #${order.orderId}</h3>
    <p style="font-size:16px;">${text}</p>
    ${
      order.trackingNumber
        ? `<div style="background:#eff6ff;border-radius:8px;padding:12px 16px;margin:16px 0;">
             <p style="margin:0;font-size:13px;color:#6b7280;">Tracking Number</p>
             <p style="margin:4px 0 0;font-weight:bold;">${order.trackingNumber}</p>
           </div>`
        : ''
    }
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
      Track your order at kaprastore.com/track-order
    </p>
  </div>`
}
