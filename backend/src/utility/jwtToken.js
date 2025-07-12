import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: "2d" }
    );
};

const isValidToken = (token) => {
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded; 
    } catch (error) {
        console.error("Invalid token:", error.message);
        return false;
    }
};

export { generateToken, isValidToken };
