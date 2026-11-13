//IMPORTS//
import Db from '../Config/db.js';

const screeningFields = `
    SELECT screenings.sc_id, screenings.sc_film, screenings.sc_room,
           screenings.sc_datetime, screenings.sc_price, films.fi_title, rooms.ro_name
    FROM screenings
    JOIN films ON films.fi_id = screenings.sc_film
    JOIN rooms ON rooms.ro_id = screenings.sc_room`;

// GET ALL //
async function getAll() {
    const [rows] = await Db.query(`${screeningFields} ORDER BY screenings.sc_datetime`);
    return rows;
}

//GET BY FILM//
async function getByFilm(filmId) {
    const [rows] = await Db.query(`${screeningFields} WHERE screenings.sc_film = ? ORDER BY screenings.sc_datetime`, [filmId]);
    return rows;
}

//GET BY ID//
async function getById(id) {
    const [rows] = await Db.query(`${screeningFields} WHERE screenings.sc_id = ?`, [id]);
    return rows[0];
}

//POST//
async function insert(screening) {
    const inserted = await Db.query(
        "INSERT INTO screenings(sc_film, sc_room, sc_datetime, sc_price) VALUES (?,?,?,?)",
        [screening.film, screening.room, screening.datetime, screening.price]);
    return inserted;
}

//PATCH//
async function update(id, screening) {
    const updated = await Db.query(
        "UPDATE screenings SET sc_film = ?, sc_room = ?, sc_datetime = ?, sc_price = ? WHERE sc_id = ?",
        [screening.sc_film, screening.sc_room, screening.sc_datetime, screening.sc_price, id]);
    return updated;
}

//DELETE//
async function deleteScreening(id) {
    const deleted = await Db.query("DELETE FROM screenings WHERE sc_id = ?", [id]);
    return deleted;
}

//EXPORTS//
export default {
    getAll,
    getByFilm,
    getById,
    insert,
    update,
    deleteScreening
}
