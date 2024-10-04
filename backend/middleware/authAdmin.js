const adminAuth = (req, res, next) => {
    const { username, password } = req.body;
  
    // Hardcoded credentials (admin/password) for now
    if (username === 'admin' && password === 'password') {
      next(); // Proceed to the next middleware or route
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
  
  module.exports = adminAuth;
  