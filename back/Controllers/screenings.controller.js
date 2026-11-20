//IMPORTS//
import filmModel from '../Models/films.model.js';
import reservationModel from '../Models/reservations.model.js';
import roomModel from '../Models/rooms.model.js';
import screeningModel from '../Models/screenings.model.js';

//GET ALL//
async function getAll(req, res) {
    try {
        const screenings = await screeningModel.getAll();
        res.json(screenings);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des séances" });
    }
}

//GET BY FILM//
async function getByFilm(req, res) {
    try {
        const filmId = req.params.filmID;
        const film = await filmModel.getById(filmId);
        if (!film) {
            return res.status(404).json({ error: "Le film n'existe pas" });
        }
        const screenings = await screeningModel.getByFilm(filmId);
        res.json(screenings);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des séances du film" });
    }
}

//GET BY ID//
async function getById(req, res) {
    try {
        const screening = await screeningModel.getById(req.params.id);
        if (!screening) {
            return res.status(404).json({ error: "La séance n'existe pas" });
        }
        res.json(screening);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération de la séance" });
    }
}

//POST//
async function insert(req, res) {
    try {
        const body = req.body || {};
        if (body.film === undefined || body.room === undefined || !body.datetime ||
            body.price === undefined || !Number.isFinite(Number(body.price)) || Number(body.price) < 0) {
            return res.status(403).json({ error: "Le film, la salle, la date et le prix sont obligatoires" });
        }
        if (!Number.isInteger(Number(body.film)) || !Number.isInteger(Number(body.room))) {
            return res.status(403).json({ error: "Les identifiants du film et de la salle doivent être des entiers" });
        }

        const film = await filmModel.getById(body.film);
        const room = await roomModel.getById(body.room);
        if (!film || !room) {
            return res.status(404).json({ error: "Le film ou la salle n'existe pas" });
        }

        const screening = await screeningModel.insert({
            film: Number(body.film),
            room: Number(body.room),
            datetime: body.datetime,
            price: Number(body.price),
        });
        res.status(201).json(screening);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de l'ajout de la séance" });
    }
}

//PATCH//
async function update(req, res) {
    try {
        const id = req.params.id;
        const body = req.body || {};
        const currentScreening = await screeningModel.getById(id);
        if (!currentScreening) {
            return res.status(404).json({ error: "La séance n'existe pas" });
        }

        const filmId = body.film !== undefined ? Number(body.film) : currentScreening.sc_film;
        const roomId = body.room !== undefined ? Number(body.room) : currentScreening.sc_room;
        const datetime = body.datetime !== undefined ? body.datetime : currentScreening.sc_datetime;
        const price = body.price !== undefined ? Number(body.price) : Number(currentScreening.sc_price);

        if (!Number.isInteger(filmId) || !Number.isInteger(roomId) || !datetime ||
            !Number.isFinite(price) || price < 0) {
            return res.status(403).json({ error: "Les champs de la séance ne sont pas valides" });
        }

        const film = await filmModel.getById(filmId);
        const room = await roomModel.getById(roomId);
        if (!film || !room) {
            return res.status(404).json({ error: "Le film ou la salle n'existe pas" });
        }

        if (roomId !== Number(currentScreening.sc_room)) {
            const reservedSeats = Number(await reservationModel.getReservedSeats(id));
            if (reservedSeats > Number(room.ro_capacity)) {
                return res.status(409).json({ error: "La capacité de cette salle est inférieure au nombre de places déjà réservées" });
            }
        }

        const result = await screeningModel.update(id, {
            sc_film: filmId,
            sc_room: roomId,
            sc_datetime: datetime,
            sc_price: price,
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour de la séance" });
    }
}

//DELETE//
async function deleteScreening(req, res) {
    try {
        const id = req.params.id;
        const screening = await screeningModel.getById(id);
        if (!screening) {
            return res.status(404).json({ error: "La séance n'existe pas" });
        }
        const deleted = await screeningModel.deleteScreening(id);
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la suppression de la séance" });
    }
}

export default {
    getAll,
    getByFilm,
    getById,
    insert,
    update,
    deleteScreening
}
