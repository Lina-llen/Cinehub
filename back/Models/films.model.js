//IMPORTS// 
import Db from '../Config/db.js';

// GET ALL //
async function getAll() {
    const [rows] = await Db.query("SELECT fi_id, fi_title, fi_description, fi_duration, fi_genre, fi_release_date, fi_is_showing, fi_image FROM films");
    return rows;
}

//IS SHOWING//
async function getFilmsShowing() {
    const [rows] = await Db.query("SELECT fi_id, fi_title, fi_description, fi_duration, fi_genre, fi_release_date, fi_is_showing, fi_image FROM films WHERE fi_is_showing = 1");
    return rows;
}

//GET BY ID//
async function getById(id) {
    const [rows] = await Db.query("SELECT fi_id, fi_title, fi_description, fi_duration, fi_genre, fi_release_date, fi_is_showing, fi_image FROM films WHERE fi_id = ?", [id]);
    return rows[0];
}

//POST//
async function insert(film) {
    const inserted = await Db.query("INSERT INTO films(fi_title, fi_description, fi_duration, fi_genre, fi_release_date, fi_is_showing, fi_image) VALUES (?,?,?,?,?,?,?)",
        [film.title, film.description, film.duration, film.genre, film.release_date, film.is_showing, film.image]);
    return inserted;
}

//PATCH//
async function update(id, film) {
    const updated = await Db.query("UPDATE films set fi_title = ?, fi_description=?, fi_duration=?, fi_genre=?, fi_release_date=?, fi_is_showing=?, fi_image=? WHERE fi_id = ?",
        [film.fi_title, film.fi_description, film.fi_duration, film.fi_genre, film.fi_release_date, film.fi_is_showing, film.fi_image, id]);
    return updated;
}


//DELETE//
async function deleteFilm(id) {
    const deleted = await Db.query("DELETE FROM films WHERE fi_id = ?", [id]);
    return deleted;
}


//EXPORTS//
export default {
    getAll,
    getFilmsShowing,
    getById,
    insert,
    update,
    deleteFilm
}
