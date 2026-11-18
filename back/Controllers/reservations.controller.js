//IMPORTS//
import screeningModel from '../Models/screenings.model.js';
import reservationModel from '../Models/reservations.model.js';

//GET ALL//
async function getAll(req, res) {
    try {
        const reservations = await reservationModel.getAll();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des réservations" });
    }
}

//GET MY RESERVATIONS//
async function getMine(req, res) {
    try {
        const reservations = await reservationModel.getByUser(req.user.us_id);
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération de vos réservations" });
    }
}

//GET BY SCREENING//
async function getByScreening(req, res) {
    try {
        const screeningId = req.params.screeningID;
        const screening = await screeningModel.getById(screeningId);
        if (!screening) {
            return res.status(404).json({ error: "La séance n'existe pas" });
        }
        const reservations = await reservationModel.getByScreening(screeningId);
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des réservations de la séance" });
    }
}

//POST//
async function insert(req, res) {
    try {
        const body = req.body || {};
        if (body.screening === undefined || body.screening === "") {
            return res.status(403).json({ error: "La séance est obligatoire" });
        }

        const screeningId = Number(body.screening);
        const seats = body.seats === undefined ? 1 : Number(body.seats);
        if (!Number.isInteger(screeningId) || screeningId < 1 ||
            !Number.isInteger(seats) || seats < 1) {
            return res.status(403).json({ error: "La séance et le nombre de places doivent être des entiers positifs" });
        }

        const screening = await reservationModel.getScreeningCapacity(screeningId);
        if (!screening) {
            return res.status(404).json({ error: "La séance n'existe pas" });
        }

        const userId = req.user.us_id;
        const existingReservation = await reservationModel.getByUserAndScreening(userId, screeningId);
        if (existingReservation) {
            return res.status(403).json({ error: "Vous avez déjà réservé cette séance" });
        }

        const reservedSeats = Number(await reservationModel.getReservedSeats(screeningId));
        if (reservedSeats + seats > screening.ro_capacity) {
            return res.status(403).json({ error: "Plus assez de places disponibles" });
        }

        const inserted = await reservationModel.insert(userId, screeningId, seats);
        const reservation = await reservationModel.getById(inserted.insertId);
        res.status(201).json(reservation);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(403).json({ error: "Vous avez déjà réservé cette séance" });
        }
        res.status(500).json({ error: "Une erreur est survenue lors de l'ajout de la réservation" });
    }
}

//DELETE//
async function deleteReservation(req, res) {
    try {
        const id = req.params.id;
        const reservation = await reservationModel.getById(id);
        if (!reservation) {
            return res.status(404).json({ error: "La réservation n'existe pas" });
        }
        if (Number(reservation.re_user) !== Number(req.user.us_id) && req.user.us_role !== "admin") {
            return res.status(403).json({ error: "Vous ne pouvez pas annuler cette réservation" });
        }

        const deleted = await reservationModel.deleteReservation(id);
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de l'annulation de la réservation" });
    }
}

export default {
    getAll,
    getMine,
    getByScreening,
    insert,
    deleteReservation
}
