import { verifyToken } from '../config/jwt.js';

export function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authorization token missing.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Token verification failure:', error.message);
    return res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
}

export default { protect };
