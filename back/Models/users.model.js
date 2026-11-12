//IMPORT//
import Db from '../Config/db.js';

//FONCTION INSERT//
async function insert(user) {
    const inserted = await Db.query("INSERT INTO users(us_username,us_email,us_password) VALUES (?,?,?)",
        [user.username, user.email, user.password]);
    return inserted;
}


//FONCTION GET BY USERNAME//
async function getByUsername(username) {
    const [rows] = await Db.query("SELECT us_id, us_username,us_email, us_password FROM users WHERE us_username = ?", [username]);
    return rows[0];
}

// A MODIFIER //
async function getAll() {
    const [rows] = await Db.query("SELECT us_id, us_username,us_email FROM users");
    return rows;
}

// Un seul utilisateur par son id. rows[0] car le WHERE ne doit renvoyer qu'une ligne.
async function getById(id) {
    const [rows] = await Db.query("SELECT us_id, us_username,us_email, us_password FROM users WHERE us_id = ?", [id]);
    return rows[0];
}

// Supprime l'utilisateur dont l'id est passé.
// Attention : s'il a des événements / commentaires liés, MySQL peut refuser
// à cause des clés étrangères.
async function deleteUser(id) {
    const deleted = await Db.query("DELETE FROM users WHERE us_id = ?", [id]);
    return deleted;
}

// Met à jour pseudo, email et mot de passe d'un utilisateur existant.
// Les noms de champs ici sont ceux de la BASE (us_username), pas ceux du body HTTP.
async function update(id, user) {
    const updated = await Db.query("UPDATE users set us_username = ?, us_email=?, us_password=? WHERE us_id = ?",
        [user.us_username, user.us_email, user.us_password, id]);
    return updated;
}

async function getByEventId(eventId) {
    const [rows] = await Db.query(`SELECT us_id, us_username, us_email
        FROM users
        INNER JOIN participants ON pa_user = us_id
        WHERE pa_event = ?`, [eventId])
    return rows;
}

// Met à jour le token de réinitialisation d'un utilisateur
async function setResetToken(id, resetToken, expires) {
    const updated = await Db.query("UPDATE users set us_reset_token = ?, us_reset_expires = ? WHERE us_id = ?",
        [resetToken, expires, id]);
    return updated;
}

// Met à jour le mot de passe d'un utilisateur
async function updatePassword(id, password) {
    const updated = await Db.query("UPDATE users set us_password = ?, us_reset_token = NULL, us_reset_expires = NULL WHERE us_id = ?",
        [password, id]);
    return updated;
}


// Cherche un utilisateur par le token de réinitialisation
async function getByResetToken(resetToken) {
    const [rows] = await Db.query("SELECT us_id, us_username, us_email, us_reset_token, us_reset_expires FROM users WHERE us_reset_token = ?", [resetToken]);
    return rows[0];
}


// Cherche un utilisateur par son email
async function getByMail(mail) {
    const [rows] = await Db.query("SELECT us_id, us_username, us_email, us_reset_token, us_reset_expires FROM users WHERE us_email = ?", [mail]);
    return rows[0];
}

// On exporte un objet : le controller fait userModel.getAll(), userModel.insert(), etc.
export default {
    insert,
    getByUsername,
}