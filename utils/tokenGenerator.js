const jwt = require('jsonwebtoken');
const secret_key = "ASkdcbgijhdlosdhflsnvsndlffjhn"; 

// Generate a JWT token with username, user ID, and role in the payload
function generateToken(user) {
  const payload = {
    name: user.name,
    mobile_number: user.mobile_number,
    role: user.role,
  };
  const expiresInDays = 10;
  const expirationTimeInSeconds = expiresInDays * 24 * 60 * 60;

  return jwt.sign(payload, secret_key, { expiresIn: expirationTimeInSeconds });
}

// Verify a JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secret_key);
    return decoded;
  } catch (error) {
    throw new Error("Token verification failed");
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
