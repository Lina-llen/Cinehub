//IMPORTS//
import express from "express";
import filmsController from '../Controllers/films.controller.js'

const router = express.Router();

router.get("/", filmsController.getAll);

router.get("/showing", filmsController.getFilmsShowing);

router.get("/:id", filmsController.getById);

router.post("/", filmsController.insert);

router.patch("/:id", filmsController.update);

router.delete("/:id", filmsController.deleteFilm);

export default router;