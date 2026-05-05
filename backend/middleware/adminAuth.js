const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error("Unauthorized access");
  }
};

module.exports = { adminAuth };
