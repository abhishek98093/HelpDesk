import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: "2d" }
    );
};

const isValidToken = (token) => {
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user=decoded;
        return decoded; 
    } catch (error) {
        console.error("Invalid token:", error);
        return false;
    }
};

export { generateToken, isValidToken };
