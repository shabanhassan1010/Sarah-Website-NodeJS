const User = require("../DBContext/Models/UserModel.js");
const jwt = require("jsonwebtoken");

const AuthMiddleware = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization; // Fix 1: Get authorization header
      
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing token" });
      }

      const token = authHeader.split(" ")[1];
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decode.id);
      if (!user) {
        return res.status(401).json({ message: "User Not Found" });
      }

      req.user = user;  // create new user
      next();
      
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  };
};

module.exports = AuthMiddleware;