export function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `ORD-${timestamp}-${random}`
}

export function generateQRCode(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `QR-${timestamp}-${random}`
}

