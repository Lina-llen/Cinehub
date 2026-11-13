//IMPORTS//
import express from "express";
import reservationController from '../Controllers/reservations.controller.js';

const router = express.Router();

router.get("/", reservationController.getAll);

router.get("/me", reservationController.getMine);

router.get("/screening/:screeningID", reservationController.getByScreening);

router.post("/", reservationController.insert);

router.delete("/:id", reservationController.deleteReservation);

export default router;
