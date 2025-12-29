import jsPDF from 'jspdf'

export function generateOrderPDF(orderNumber: string, orderDetails: any): Buffer {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('Order Confirmation', 20, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`${process.env.APP_NAME || 'Eggbator'} - Professional Egg Incubator Solutions`, 20, 28)
  
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Order Number: ${orderNumber}`, 20, 35)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42)
  
  // Customer Details
  doc.setFontSize(14)
  doc.text('Customer Details', 20, 55)
  doc.setFontSize(10)
  doc.text(`Name: ${orderDetails.customerName}`, 20, 65)
  doc.text(`Email: ${orderDetails.customerEmail}`, 20, 72)
  if (orderDetails.shippingAddress) {
    doc.text(`Address: ${orderDetails.shippingAddress}`, 20, 79)
  }
  
  // Order Items
  let yPos = 95
  doc.setFontSize(14)
  doc.text('Order Items', 20, yPos)
  yPos += 10
  
  doc.setFontSize(10)
  orderDetails.items.forEach((item: any, index: number) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.text(`${index + 1}. ${item.productName}`, 25, yPos)
    if (item.variantName) {
      doc.text(`   Variant: ${item.variantName}`, 30, yPos + 7)
    }
    doc.text(`   Quantity: ${item.quantity}`, 30, yPos + 14)
    doc.text(`   Price: ₹${item.price.toFixed(2)}`, 30, yPos + 21)
    yPos += 30
  })
  
  // Total
  yPos += 10
  doc.setFontSize(12)
  doc.text(`Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}`, 20, yPos)
  
  // Footer
  doc.setFontSize(10)
  doc.text('Thank you for your order!', 20, 280)
  doc.setTextColor(100, 100, 100)
  doc.text(`${process.env.APP_NAME || 'Eggbator'}`, 20, 287)
  
  return Buffer.from(doc.output('arraybuffer'))
}

