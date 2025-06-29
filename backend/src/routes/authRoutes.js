import { login,signup,logout } from "../controllers/authControllers.js";
import express from 'express';
import { Router } from "express";
const router=Router();

router.post('/login',login);
router.post('/logout',logout);
router.post('/signup', signup);

export default router;