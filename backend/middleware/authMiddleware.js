// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyClearance = (req, res, next) => {
  // 1. Grab token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access Denied: Missing security token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token signature against your backend secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach decoded operator data (id, username, role) to the request object
    req.operator = decoded;
    
    // 4. Pass execution control to the next route handler
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access Denied: Invalid or expired token.' });
  }
};

