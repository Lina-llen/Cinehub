//IMPORTS//
import express from "express";
import filmsController from '../Controllers/films.controller.js'
import checkAdmin from '../Middlewares/admin.middleware.js';

const router = express.Router();

router.get("/", filmsController.getAll);

router.get("/showing", filmsController.getFilmsShowing);

router.get("/:id", filmsController.getById);

router.post("/", checkAdmin, filmsController.insert);

router.patch("/:id", checkAdmin, filmsController.update);

router.delete("/:id", checkAdmin, filmsController.deleteFilm);

export default router;