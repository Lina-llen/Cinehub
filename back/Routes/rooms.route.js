//IMPORTS//
import express from "express";
import roomController from '../Controllers/rooms.controller.js';

const router = express.Router();

router.get("/", roomController.getAll);

router.get("/:id", roomController.getById);

router.post("/", roomController.insert);

router.patch("/:id", roomController.update);

router.delete("/:id", roomController.deleteRoom);

export default router;
