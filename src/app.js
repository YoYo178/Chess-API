import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors"

import APIRoutes from "./routes/api/index.js"

let app = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", APIRoutes)

app.get("/404", (req, res) => {
	res.status(404).send("NOT FOUND")
})

// No matching routes were found, redirect to /404
app.use((req, res, next) => {
	res.redirect("/404")
})

export default app;
