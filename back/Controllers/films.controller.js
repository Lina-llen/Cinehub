//IMPORTS//
import filmModel from '../Models/films.model.js';

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
                return res.status(404).json({ erreur: "Le film n'existe pas" });
            }
            res.json(film);
        } catch (error) {
            res.status(500).json({ error: "Une erreur est survenue lors de la récupération du film" })
        }
}   

//POST//
async function insert(req, res) {
    try {
        const body = req.body;
        const newFilm = await filmModel.insert(body);
        res.status(201).json(newFilm);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de l'ajout du film" });
    }
}

//PATCH//
async function update(req, res) {
    try {
        const id = req.params.id;
        const body = req.body || {};
        const film = await filmModel.getById(id);
        if (!film) {
            return res.status(404).json({ erreur: "Le film n'existe pas" });
        }

        const updatedFilm = {
            fi_title: body.title !== undefined ? body.title : film.fi_title,
            fi_description: body.description !== undefined ? body.description : film.fi_description,
            fi_duration: body.duration !== undefined ? body.duration : film.fi_duration,
            fi_genre: body.genre !== undefined ? body.genre : film.fi_genre,
            fi_release_date: body.release_date !== undefined ? body.release_date : film.fi_release_date,
            fi_is_showing: body.is_showing !== undefined ? body.is_showing : film.fi_is_showing,
        };
        const result = await filmModel.update(id, updatedFilm);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du film" });
    }
}

//DELETE//
async function deleteFilm(req, res) {
    try {
        const id = req.params.id;
        const deletedFilm = await filmModel.deleteFilm(id);
        res.json(deletedFilm);
    } catch (error) {
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
