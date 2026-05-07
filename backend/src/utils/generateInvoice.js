import PDFDocument from 'pdfkit'

export const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })

  // Pipe to response
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Invoice-${order.orderId}.pdf`
  )
  doc.pipe(res)

  // ── Header ──────────────────────────────────────────
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#b45309')
    .text('KAPRA STORE', 50, 50)

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#6b7280')
    .text('Premium Unstitched Fabric', 50, 78)
    .text('Sadiqabad, Rahim Yar Khan, Punjab, Pakistan', 50, 90)
    .text('hello@kaprastore.com  |  WhatsApp: 03XX-XXXXXXX', 50, 102)

  // INVOICE title + order ID (right side)
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .fillColor('#1f2937')
    .text('INVOICE', 400, 50, { align: 'right' })

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#6b7280')
    .text(`Order ID: ${order.orderId}`, 400, 75, { align: 'right' })
    .text(
      `Date: ${new Date(order.createdAt).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`,
      400,
      90,
      { align: 'right' }
    )
    .text(`Payment: ${order.paymentMethod}`, 400, 105, { align: 'right' })

  // Divider
  doc
    .moveTo(50, 125)
    .lineTo(545, 125)
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .stroke()

  // ── Bill To ──────────────────────────────────────────
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#374151')
    .text('BILL TO:', 50, 140)

  const addr = order.shippingAddress
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#1f2937')
    .text(addr?.fullName || order.guestInfo?.name || '—', 50, 155)
    .text(addr?.street || '', 50, 168)
    .text(
      `${addr?.city || ''}${addr?.district ? `, ${addr.district}` : ''}`,
      50,
      181
    )
    .text(addr?.province || '', 50, 194)
    .text(`Phone: ${addr?.phone || '—'}`, 50, 207)

  // ── Items Table ──────────────────────────────────────
  const tableTop = 240

  // Table header
  doc.rect(50, tableTop, 495, 24).fill('#f9fafb')

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#6b7280')

  const cols = { item: 50, qty: 310, price: 370, total: 460 }

  doc
    .text('ITEM', cols.item, tableTop + 8)
    .text('QTY', cols.qty, tableTop + 8)
    .text('UNIT PRICE', cols.price, tableTop + 8)
    .text('TOTAL', cols.total, tableTop + 8)

  // Table rows
  let y = tableTop + 34
  doc.font('Helvetica').fillColor('#1f2937')

  order.items?.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.rect(50, y - 6, 495, 24).fill('#fafafa')
    }

    doc
      .fontSize(9)
      .fillColor('#1f2937')
      .text(item.name, cols.item, y, { width: 240, ellipsis: true })
      .text(String(item.qty), cols.qty, y)
      .text(`Rs. ${item.price.toLocaleString()}`, cols.price, y)
      .text(`Rs. ${(item.price * item.qty).toLocaleString()}`, cols.total, y)

    y += 28
  })

  // Divider after items
  doc
    .moveTo(50, y + 8)
    .lineTo(545, y + 8)
    .strokeColor('#e5e7eb')
    .lineWidth(0.5)
    .stroke()

  y += 22

  // ── Totals ───────────────────────────────────────────
  const totals = [
    { label: 'Subtotal', value: `Rs. ${order.subtotal?.toLocaleString()}` },
    {
      label: 'Shipping',
      value: order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee}`
    }
  ]
  if (order.discount > 0) {
    totals.push({
      label: 'Discount',
      value: `-Rs. ${order.discount?.toLocaleString()}`
    })
  }

  totals.forEach(({ label, value }) => {
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(label, 380, y)
      .fillColor('#1f2937')
      .text(value, 460, y)
    y += 18
  })

  // Grand total box
  doc.rect(370, y + 4, 175, 32).fill('#b45309')

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#ffffff')
    .text('TOTAL', 380, y + 13)
    .text(`Rs. ${order.total?.toLocaleString()}`, 460, y + 13)

  y += 55

  // ── Footer ───────────────────────────────────────────
  doc
    .moveTo(50, y)
    .lineTo(545, y)
    .strokeColor('#e5e7eb')
    .lineWidth(0.5)
    .stroke()

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#9ca3af')
    .text('Thank you for shopping with Kapra Store!', 50, y + 12, {
      align: 'center'
    })
    .text(
      'For returns & support: hello@kaprastore.com | WhatsApp: 03XX-XXXXXXX',
      50,
      y + 24,
      { align: 'center' }
    )
    .text(
      '7-day easy returns | Cash on Delivery | Nationwide Delivery',
      50,
      y + 36,
      { align: 'center' }
    )

  doc.end()
}
