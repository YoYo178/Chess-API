import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

var app = express();

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

export default app;
