//IMPORTS//
import roomModel from '../Models/rooms.model.js';

//GET ALL//
async function getAll(req, res) {
    try {
        const rooms = await roomModel.getAll();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des salles" });
    }
}

//GET BY ID//
async function getById(req, res) {
    try {
        const room = await roomModel.getById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "La salle n'existe pas" });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération de la salle" });
    }
}

//POST//
async function insert(req, res) {
    try {
        const body = req.body || {};
        if (!body.name || !Number.isInteger(Number(body.capacity)) || Number(body.capacity) < 1) {
            return res.status(403).json({ error: "Le nom et une capacité entière positive sont obligatoires" });
        }

        const room = await roomModel.insert({ name: body.name, capacity: Number(body.capacity) });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de l'ajout de la salle" });
    }
}

//PATCH//
async function update(req, res) {
    try {
        const id = req.params.id;
        const body = req.body || {};
        const room = await roomModel.getById(id);
        if (!room) {
            return res.status(404).json({ error: "La salle n'existe pas" });
        }

        if (body.name !== undefined && !body.name) {
            return res.status(403).json({ error: "Le nom de la salle ne peut pas être vide" });
        }
        if (body.capacity !== undefined && (!Number.isInteger(Number(body.capacity)) || Number(body.capacity) < 1)) {
            return res.status(403).json({ error: "La capacité doit être un entier positif" });
        }

        const updatedRoom = {
            ro_name: body.name !== undefined ? body.name : room.ro_name,
            ro_capacity: body.capacity !== undefined ? Number(body.capacity) : room.ro_capacity,
        };
        const result = await roomModel.update(id, updatedRoom);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour de la salle" });
    }
}

//DELETE//
async function deleteRoom(req, res) {
    try {
        const id = req.params.id;
        const room = await roomModel.getById(id);
        if (!room) {
            return res.status(404).json({ error: "La salle n'existe pas" });
        }
        const deleted = await roomModel.deleteRoom(id);
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la suppression de la salle" });
    }
}

export default {
    getAll,
    getById,
    insert,
    update,
    deleteRoom
}
