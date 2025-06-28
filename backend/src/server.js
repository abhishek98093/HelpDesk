import express  from 'express';
const app=express();
import authRoutes from './routes/authRoute.js';

app.use('/api/auth',authRoutes);
app.listen(5001,()=>{
    console.log('app is running on 5001');
});