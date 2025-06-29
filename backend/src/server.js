import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
const app=express();
dotenv.config();
const PORT=process.env.PORT;
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './lib/db.js';
app.use(express.json());
app.use('/api/auth',authRoutes);


app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    connectDB();
})