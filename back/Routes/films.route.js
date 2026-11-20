//IMPORTS//
import express from "express";
import filmsController from '../Controllers/films.controller.js'
import checkAdmin from '../Middlewares/admin.middleware.js';
import uploadFilmImage from '../Middlewares/film-image-upload.middleware.js';

const router = express.Router();

router.get("/", filmsController.getAll);

router.get("/showing", filmsController.getFilmsShowing);

router.get("/:id", filmsController.getById);

router.post("/", checkAdmin, uploadFilmImage, filmsController.insert);

router.patch("/:id", checkAdmin, uploadFilmImage, filmsController.update);

router.delete("/:id", checkAdmin, filmsController.deleteFilm);

export default router;