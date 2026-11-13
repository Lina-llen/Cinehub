//IMPORTS//
import Db from '../Config/db.js';

// GET ALL //
async function getAll() {
    const [rows] = await Db.query("SELECT ro_id, ro_name, ro_capacity FROM rooms");
    return rows;
}

//GET BY ID//
async function getById(id) {
    const [rows] = await Db.query("SELECT ro_id, ro_name, ro_capacity FROM rooms WHERE ro_id = ?", [id]);
    return rows[0];
}

//POST//
async function insert(room) {
    const inserted = await Db.query("INSERT INTO rooms(ro_name, ro_capacity) VALUES (?,?)",
        [room.name, room.capacity]);
    return inserted;
}

//PATCH//
async function update(id, room) {
    const updated = await Db.query("UPDATE rooms SET ro_name = ?, ro_capacity = ? WHERE ro_id = ?",
        [room.ro_name, room.ro_capacity, id]);
    return updated;
}

//DELETE//
async function deleteRoom(id) {
    const deleted = await Db.query("DELETE FROM rooms WHERE ro_id = ?", [id]);
    return deleted;
}

//EXPORTS//
export default {
    getAll,
    getById,
    insert,
    update,
    deleteRoom
}
