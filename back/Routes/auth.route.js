import express from "express";
import authController from '../Controllers/auth.contoller.js'

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

export default router;