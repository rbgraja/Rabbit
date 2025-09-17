const jwt = require("jsonwebtoken");

/**
 * ========================================================
 * Middleware: protect (updated)
 * Purpose: Allow access to logged-in users OR guests with guestId
 * ========================================================
 */
const protect = (req, res, next) => {
  const token = getTokenFromHeader(req);

  // ✅ Allow guest if guestId is present (either in body or query)
  if (!token && (req.body?.guestId || req.query?.guestId)) {
    console.log("👤 Guest access granted with guestId");
    req.user = null; // no logged-in user
    return next();
  }

  if (!token) {
    console.log("🚫 No token found in headers");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);

    req.user = decoded.user; // attach user object from token

    console.log("✅ Final req.user.id:", req.user.id);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ========================================================
 * Middleware: authorizeRoles
 * Purpose: Allow access only to specified user roles
 * Usage: authorizeRoles("admin"), authorizeRoles("admin", "manager")
 * ========================================================
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
      });
    }
    next();
  };
};

/**
 * ========================================================
 * Helper: getTokenFromHeader
 * Extracts token from Authorization header using Bearer scheme
 * ========================================================
 */
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (
    authHeader &&
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    return authHeader.split(" ")[1];
  }
  return null;
};

// 📤 Export all middlewares
module.exports = {
  protect,
  authorizeRoles,
};
