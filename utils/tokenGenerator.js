const jwt = require('jsonwebtoken');
const secret_key = "ASkdcbgijhdlosdhflsnvsndlffjhn";

function generateToken(user, deviceIdentifier) {
  const payload = {
    name: user.name,
    mobile_number: user.mobile_number,
    role: user.role,
    status: user.status
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
