const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error("JWT Verification Error:", err.message);
          return res.status(401).json({ message: "User is not authorized" });
        }

        req.user = decoded;

        if (!req.user) {
          return res.status(401).json({ message: "User not found" });
        }

        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Access Denied: Insufficient Role" });
        }

        next();
      });
    } else {
      return res.status(401).json({ message: "Unauthorized: Token missing or malformed" });
    }
  });

module.exports = { validateToken };
