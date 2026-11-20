//IMPORTS//
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './Routes/auth.route.js'
import checkToken from './Middlewares/auth.middleware.js';
import userRoutes from './Routes/users.route.js';
import filmsRoutes from './Routes/films.route.js';
import roomsRoutes from './Routes/rooms.route.js';
import screeningsRoutes from './Routes/screenings.route.js';
import reservationsRoutes from './Routes/reservations.route.js';
import { fileURLToPath } from 'node:url';


dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(fileURLToPath(new URL('./uploads/', import.meta.url))));

//ROUTES//
app.use("/auth", authRoutes);
app.use("/users", checkToken, userRoutes);
app.use("/films", checkToken, filmsRoutes);
app.use("/rooms", checkToken, roomsRoutes);
app.use("/screenings", checkToken, screeningsRoutes);
app.use("/reservations", checkToken, reservationsRoutes);

//ROUTE DE TEST//
app.use('/', (req, res) => {
    res.json({status : "OK"});
});

app.listen(process.env.SERVER_PORT, () => {
    console.log("http://127.0.0.1:"+process.env.SERVER_PORT);
});