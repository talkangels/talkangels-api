const ErrorHandler = require("./errorHandler");
const { verifyToken } = require("../utils/tokenGenerator");

const authenticateUser = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(new ErrorHandler("Please logIn to access this resource", 401));
  }

  const bearer = authorizationHeader.split(' ')[1];
  const token = bearer;

  try {
    const { name, mobile_number, role } = verifyToken(token);
    req.user = { name, mobile_number, role };
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token, Please Log-Out and Log-In again", 401));
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`You do not have permission to access this resource`, 403));
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
