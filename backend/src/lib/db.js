import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
export const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`MongoDB data base is connected : ${conn.connection.host}`);
    }catch(error){
        console.log("Error connecting with MongoDB : ",error);
        process.exit(1);
    }
}