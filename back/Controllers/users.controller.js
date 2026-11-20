//IMPORTS//
import userModel from "../Models/users.model.js";
import bcrypt from 'bcrypt';

//GET ALL//
async function getAll(req, res) {
    try {
        const users = await userModel.getAll();
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des users" })
    }
}

//GET BY ID//
async function getById(req, res) {
    try {
        const id = req.params.id;
        const user = await userModel.getById(id);
        if (!user) {
            return res.status(404).json({ error: "L'utilisateur n'existe pas" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération de l'utilisateur" })
    }
}

//MODIFICATION//
async function update(req, res) {
    try {
        const id = req.params.id;
        const body = req.body || {};
        if (body.password !== undefined) {
            return res.status(403).json({ error: "Le mot de passe ne peut pas être modifié depuis cette route" });
        }

        const user = await userModel.getById(id);
        if (!user) {
            return res.status(404).json({ error: "L'utilisateur n'existe pas" });
        }
        if (Number(id) !== Number(req.user.us_id) && req.user.us_role !== "admin") {
            return res.status(403).json({ error: "Vous ne pouvez modifier que votre propre compte" });
        }
        if (body.email) {
            user.us_email = body.email;
        }

        if (body.username) {
            user.us_username = body.username;
        }

        const updated = await userModel.update(id, user);
        res.json({ message: "Votre modification à bien été effectué", user });
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la modification de l'utilisateur" })
    }
}

//CHANGE OWN PASSWORD//
async function changeMyPassword(req, res) {
    try {
        const body = req.body || {};
        if (typeof body.currentPassword !== "string" || !body.currentPassword ||
            typeof body.newPassword !== "string" || !body.newPassword) {
            return res.status(400).json({ error: "L'ancien et le nouveau mot de passe sont obligatoires" });
        }

        const passwordRecord = await userModel.getPasswordRecord(req.user.us_id);
        if (!passwordRecord) {
            return res.status(404).json({ error: "L'utilisateur n'existe pas" });
        }
        if (passwordRecord.us_role !== "user") {
            return res.status(403).json({ error: "La modification du mot de passe est réservée aux utilisateurs" });
        }

        const passwordMatches = await bcrypt.compare(body.currentPassword, passwordRecord.us_password);
        if (!passwordMatches) {
            return res.status(403).json({ error: "L'ancien mot de passe est incorrect" });
        }

        const passwordHash = await bcrypt.hash(body.newPassword, 10);
        await userModel.updatePassword(req.user.us_id, passwordHash);
        res.json({ message: "Votre mot de passe a été modifié" });
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la modification du mot de passe" });
    }
}

//SUPPRESSION//
async function deleteUser(req, res) {
    try {
        const id = req.params.id;
        const user = await userModel.getById(id);
        if (!user) {
            return res.status(404).json({ error: "L'utilisateur n'existe pas" });
        }
        if (Number(id) !== Number(req.user.us_id) && req.user.us_role !== "admin") {
            return res.status(403).json({ error: "Vous ne pouvez supprimer que votre propre compte" });
        }
        const deleted = await userModel.deleteUser(id);
        res.json({ message: "Votre suppression à bien été faite", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Une erreur est survenue lors de la suppression de l'utilisateur" })
    }
}

//PROFILE//
async function getMe(req, res) {
    try {
        const userConnected = await userModel.getMe(req.user.us_id);
        if (!userConnected) {
            return res.status(404).json({ error: "L'utilisateur n'existe pas" });
        }
        res.json(userConnected);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération du profile" })
    }
}

export default {
    getAll,
    getById,
    update,
    changeMyPassword,
    deleteUser,
    getMe,
}