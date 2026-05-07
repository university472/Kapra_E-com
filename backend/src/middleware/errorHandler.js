export const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`)
  res.status(404)
  next(error)
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      message: `${field} already exists`,
      field
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ message: 'Invalid token' })
  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ message: 'Token expired' })

  res.status(statusCode).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
