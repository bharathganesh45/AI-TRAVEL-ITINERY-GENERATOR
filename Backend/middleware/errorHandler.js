export function errorHandler(err, req, res, _next) {
  const statusCode = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  if (err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 15MB limit.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded.' });
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({ error: 'Too many form fields.' });
    }
    return res.status(400).json({ error: err.message || 'File upload failed.' });
  }

  if (err?.message?.includes('Unsupported file format')) {
    return res.status(400).json({ error: err.message });
  }

  if (err?.message?.includes('CORS')) {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  console.error(`❌ [${req.method} ${req.path}] Error (${statusCode}):`, message);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err?.stack }),
  });
}

export default errorHandler;
