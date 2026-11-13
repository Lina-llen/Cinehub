//IMPORTS//
import Db from '../Config/db.js';

const reservationDetails = `
    SELECT reservations.re_id, reservations.re_user, reservations.re_screening,
           reservations.re_seats, reservations.re_created_at, users.us_username,
           films.fi_title, screenings.sc_datetime, rooms.ro_name, screenings.sc_price
    FROM reservations
    JOIN users ON users.us_id = reservations.re_user
    JOIN screenings ON screenings.sc_id = reservations.re_screening
    JOIN films ON films.fi_id = screenings.sc_film
    JOIN rooms ON rooms.ro_id = screenings.sc_room`;

//GET ALL//
async function getAll() {
    const [rows] = await Db.query(`${reservationDetails} ORDER BY reservations.re_created_at DESC`);
    return rows;
}

//GET BY USER//
async function getByUser(userId) {
    const [rows] = await Db.query(`${reservationDetails} WHERE reservations.re_user = ? ORDER BY screenings.sc_datetime`, [userId]);
    return rows;
}

//GET BY SCREENING//
async function getByScreening(screeningId) {
    const [rows] = await Db.query(`${reservationDetails} WHERE reservations.re_screening = ? ORDER BY reservations.re_created_at DESC`, [screeningId]);
    return rows;
}

//GET BY ID//
async function getById(id) {
    const [rows] = await Db.query(`${reservationDetails} WHERE reservations.re_id = ?`, [id]);
    return rows[0];
}

//GET SCREENING CAPACITY//
async function getScreeningCapacity(screeningId) {
    const [rows] = await Db.query(
        "SELECT screenings.sc_id, rooms.ro_capacity FROM screenings JOIN rooms ON rooms.ro_id = screenings.sc_room WHERE screenings.sc_id = ?",
        [screeningId]);
    return rows[0];
}

//GET USER RESERVATION FOR SCREENING//
async function getByUserAndScreening(userId, screeningId) {
    const [rows] = await Db.query(
        "SELECT reservations.re_id FROM reservations WHERE reservations.re_user = ? AND reservations.re_screening = ?",
        [userId, screeningId]);
    return rows[0];
}

//GET RESERVED SEATS//
async function getReservedSeats(screeningId) {
    const [rows] = await Db.query(
        "SELECT COALESCE(SUM(reservations.re_seats), 0) AS reserved_seats FROM reservations WHERE reservations.re_screening = ?",
        [screeningId]);
    return rows[0].reserved_seats;
}

//POST//
async function insert(userId, screeningId, seats) {
    const [inserted] = await Db.query(
        "INSERT INTO reservations(re_user, re_screening, re_seats) VALUES (?,?,?)",
        [userId, screeningId, seats]);
    return inserted;
}

//DELETE//
async function deleteReservation(id) {
    const deleted = await Db.query("DELETE FROM reservations WHERE re_id = ?", [id]);
    return deleted;
}

//EXPORTS//
export default {
    getAll,
    getByUser,
    getByScreening,
    getById,
    getScreeningCapacity,
    getByUserAndScreening,
    getReservedSeats,
    insert,
    deleteReservation
}
