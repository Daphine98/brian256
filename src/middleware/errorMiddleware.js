// Central place for unknown routes and unexpected errors.
export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, req, res, next) {
  console.error(error)
  res.status(500).json({ message: 'Something went wrong on the server' })
}
