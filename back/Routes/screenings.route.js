//IMPORTS//
import express from "express";
import screeningController from '../Controllers/screenings.controller.js';

const router = express.Router();

router.get("/", screeningController.getAll);

router.get("/film/:filmID", screeningController.getByFilm);

router.get("/:id", screeningController.getById);

router.post("/", screeningController.insert);

router.patch("/:id", screeningController.update);

router.delete("/:id", screeningController.deleteScreening);

export default router;
