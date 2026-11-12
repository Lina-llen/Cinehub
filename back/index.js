import express from 'express'

import dotenv from 'dotenv'
import authRoutes from './Routes/auth.route.js'
import checkToken from './Middlewares/auth.middleware.js';


dotenv.config;

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);


app.use('/', (req, res) => {
    res.json({status : "Ok"});
});

app.listen(process.env.SERVER_PORT, () => {
    console.log("http://127.0.0.1:"+process.env.SERVER_PORT);
});