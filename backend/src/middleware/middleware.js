import {isValidToken} from '../utility/jwtToken.js';
import User from '../models/User.js';

const authenticate = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided, login again" });
    }

    const decoded = isValidToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Session expired, login/signup again" });
    }

    try {
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        req.user = user; // attach full user data to request
        next(); // proceed to next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ message: "Server error during authentication" });
    }
};

export { authenticate };
