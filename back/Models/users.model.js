//IMPORTS//
import Db from '../Config/db.js';

//FONCTION INSERT//
async function insert(user) {
    const inserted = await Db.query("INSERT INTO users(us_username,us_email,us_password) VALUES (?,?,?)",
        [user.username, user.email, user.password]);
    return inserted;
}

//FONCTION GET BY USERNAME//
async function getByUsername(username) {
    const [rows] = await Db.query("SELECT us_id, us_username,us_email, us_password, us_role FROM users WHERE us_username = ?", [username]);
    return rows[0];
}

// GET ALL //
async function getAll() {
    const [rows] = await Db.query("SELECT us_id, us_username, us_email, us_role FROM users");
    return rows;
}

//GET BY ID //
async function getById(id) {
    const [rows] = await Db.query("SELECT us_id, us_username,us_email, us_role FROM users WHERE us_id = ?", [id]);
    return rows[0];
}

//DELETE USER//
async function deleteUser(id) {
    const deleted = await Db.query("DELETE FROM users WHERE us_id = ?", [id]);
    return deleted;
}

//UPDATE USER//
async function update(id, user) {
    let updated;
    if (user.us_password) {
        updated = await Db.query("UPDATE users set us_username = ?, us_email = ?, us_password = ? WHERE us_id = ?",
            [user.us_username, user.us_email, user.us_password, id]);
    } else {
        updated = await Db.query("UPDATE users set us_username = ?, us_email = ? WHERE us_id = ?",
            [user.us_username, user.us_email, id]);
    }
    return updated;
}

async function getMe(id) {
    const [rows] = await Db.query("SELECT us_id, us_username,us_email, us_role FROM users WHERE us_id = ?", [id]);
    return rows[0];
}


//EXPORTS//
export default {
    insert,
    getByUsername,
    getAll,
    getById,
    deleteUser,
    update,
    getMe
}