const jwt = require('jsonwebtoken');
const secretKey = 'AshwinIsADumbCoderNoob28'; // Replace with your actual secret key

/**
 * Generates a JWT token for a user.
 * 
 * @param {ObjectId} userId - The ID of the user.
 * @param {string} role - The role of the user.
 * @returns {string} The JWT token.
 */
function generateAuthToken(userId, role) {
  const payload = { sub: userId, role: role };
  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}
exports.generateAuthToken = generateAuthToken;

/**
 * Middleware to require authentication for a route.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function requireAuthentication(req, res, next) {
  console.log(req.body,req.url)
  if (req.url === '/login') {
  
   next();
  }
  else{
  const authHeader = req.headers['authorization'];
  const token = authHeader;
  jwt.verify(token, secretKey, (err, payload) => {
    if (err) {
      res.status(401).json({
        error: "Invalid authentication token"
      });
    } else {
      req.user = payload.sub;
      req.role = payload.role;
     
      next();
    }
  });
  }
  
}
exports.requireAuthentication = requireAuthentication;

/**
 * Middleware to require a specific user role for a route.
 * 
 * @param {string} role - The required role.
 * @returns {Function} Middleware function to check the user role.
 */
function requireRole(role) {
  return function (req, res, next) {
    if (req.role !== role) {
      res.status(403).json({
        error: "Unauthorized"
      });
    } else {
      next();
    }
  };
}
exports.requireRole = requireRole;
