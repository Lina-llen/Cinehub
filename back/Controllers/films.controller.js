//IMPORTS//
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import filmModel from '../Models/films.model.js';
import screeningModel from '../Models/screenings.model.js';

const uploadsDirectory = path.resolve(fileURLToPath(new URL('../uploads/', import.meta.url)));

function getUploadedImagePath(req) {
    return req.file ? 'films/' + req.file.filename : null;
}

async function removeStoredImage(imagePath) {
    if (!imagePath) {
        return;
    }

    const absolutePath = path.resolve(uploadsDirectory, imagePath);
    if (!absolutePath.startsWith(uploadsDirectory + path.sep)) {
        throw new Error('Le chemin de l’image du film est invalide.');
    }

    try {
        await unlink(absolutePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}

async function cleanupStoredImage(imagePath) {
    try {
        await removeStoredImage(imagePath);
    } catch (error) {
        console.error('Impossible de supprimer le fichier image du film', error);
    }
}

//GET ALL// 
async function getAll(req, res) {
    try {
        const films = await filmModel.getAll();
        res.json(films)
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des films" })
    }
}

//IS SHOWING//
async function getFilmsShowing(req,res) {
    try {
    const filmsShowing = await filmModel.getFilmsShowing();
    res.json(filmsShowing);
} catch (error) {
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des films" })
}
}

//GET BY ID//
async function getById(req, res) {
    try {
            const id = req.params.id;
            const film = await filmModel.getById(id);
            if (!film) {
                return res.status(404).json({ error: "Le film n'existe pas" });
            }
            const screenings = await screeningModel.getUpcomingByFilm(id);
            res.json({ ...film, screenings });
        } catch (error) {
            res.status(500).json({ error: "Une erreur est survenue lors de la récupération du film" })
        }
}   

//POST//
async function insert(req, res) {
    const imagePath = getUploadedImagePath(req);
    try {
        const body = req.body || {};
        const newFilm = await filmModel.insert({
            ...body,
            duration: body.duration === undefined ? undefined : Number(body.duration),
            release_date: body.release_date || null,
            is_showing: body.is_showing === undefined
                ? 1
                : body.is_showing === 'true' || body.is_showing === '1' || body.is_showing === true || body.is_showing === 1,
            image: imagePath,
        });
        res.status(201).json(newFilm);
    } catch (error) {
        console.error(error);
        await cleanupStoredImage(imagePath);
        res.status(500).json({ error: "Une erreur est survenue lors de l'ajout du film" });
    }
}

//PATCH//
async function update(req, res) {
    const newImagePath = getUploadedImagePath(req);
    try {
        const id = req.params.id;
        const body = req.body || {};
        const film = await filmModel.getById(id);
        if (!film) {
            await cleanupStoredImage(newImagePath);
            return res.status(404).json({ error: "Le film n'existe pas" });
        }

        const updatedFilm = {
            fi_title: body.title !== undefined ? body.title : film.fi_title,
            fi_description: body.description !== undefined ? body.description : film.fi_description,
            fi_duration: body.duration !== undefined ? Number(body.duration) : film.fi_duration,
            fi_genre: body.genre !== undefined ? body.genre : film.fi_genre,
            fi_release_date: body.release_date !== undefined ? body.release_date || null : film.fi_release_date,
            fi_is_showing: body.is_showing !== undefined
                ? body.is_showing === 'true' || body.is_showing === '1' || body.is_showing === true || body.is_showing === 1
                : film.fi_is_showing,
            fi_image: newImagePath || film.fi_image,
        };
        const result = await filmModel.update(id, updatedFilm);
        if (newImagePath && film.fi_image) {
            await cleanupStoredImage(film.fi_image);
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        await cleanupStoredImage(newImagePath);
        res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du film" });
    }
}

//DELETE//
async function deleteFilm(req, res) {
    try {
        const id = req.params.id;
        const film = await filmModel.getById(id);
        if (!film) {
            return res.status(404).json({ error: "Le film n'existe pas" });
        }
        const deletedFilm = await filmModel.deleteFilm(id);
        await cleanupStoredImage(film.fi_image);
        res.json(deletedFilm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Une erreur est survenue lors de la suppression du film" });
    }
}

export default {
    getAll,
    getFilmsShowing,
    getById,
    insert,
    update,
    deleteFilm
}
