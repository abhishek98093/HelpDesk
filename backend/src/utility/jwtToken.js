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

export default generateToken;
