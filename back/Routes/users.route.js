//IMPORTS//
import express from "express";
import userController from '../Controllers/users.controller.js'
import checkAdmin from '../Middlewares/admin.middleware.js';

const router = express.Router();

router.get("/", checkAdmin, userController.getAll);

router.get("/me", userController.getMe);

router.get("/:id", userController.getById);

router.patch("/:id", userController.update);

router.delete("/:id", userController.deleteUser);

export default router;