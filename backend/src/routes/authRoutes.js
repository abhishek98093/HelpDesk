import { login,signup,logout,onboard } from "../controllers/authControllers.js";
import express from 'express';
import { Router } from "express";
import { authenticate } from "../middleware/middleware.js";
const router=Router();

router.post('/login',login);
router.post('/logout',logout);
router.post('/signup', signup);
router.post('/onboarding',authenticate,onboard);

export default router;