// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../app/models/User")

dotenv.config();
const secretKey = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
    console.log("from authMiddleware", req.session);
    const token = req.session.token;
    if (!token) {
        // return res.status(401).json({ message: "Unauthorized" });
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), secretKey);
        const user = await User.findById(decoded.userId).populate('roleId');
        if (!user) {
            return res.status(403).json({ message: "User not found" });
        }

        // Check user's role
        const role = user.roleId.name; // Assuming roleId contains the role name

        if (role === 'student') {
            // If the user is a student, prevent access to certain routes
            return res.status(403).json({ message: "Access forbidden for students" });
        } else if (role === 'manager') {
            // If the user is a manager, allow access to certain routes
            if (req.originalUrl.startsWith('/manager')) {
                req.role = role;
                return next(); // Allow access
            } else {
                return res.status(403).json({ message: "Access forbidden" });
            }
        } else if (role === 'coordinator') {
            // If the user is a coordinator, allow access to certain routes
            if (req.originalUrl.startsWith('/coordinator')) {
                req.role = role;
                return next(); // Allow access
            } else {
                return res.status(403).json({ message: "Access forbidden" });
            }
        }

        // Allow access for users with the role "admin" to all routes
        if (role === 'admin') {
            req.role = role;
            return next(); // Allow access
        }

        
    } catch (err) {
        return res.status(403).json({ message: "Invalid token ", token: token, error: err });
    }
}

module.exports = authMiddleware;