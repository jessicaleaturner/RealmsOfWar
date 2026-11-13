"use strict";

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";

import questRoutes from "./src/routes/questRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import eventRoutes from "./src/routes/eventRoutes.js";
import serverTimeRoute from "./src/routes/serverTimeRoute.js";
import fireBaseRoute from "./src/routes/fireBaseRoute.js";

const app = express();
const PORT = process.env.PORT || 8080;

// mongoose connection
// IMPORTANT!: Make sure to have env file set up! Check documentation!
dotenv.config();
let uriString = process.env.MONGOLAB_BLACK_URI || process.env.MONGO;
mongoose.Promise = global.Promise;
mongoose.connect(
  uriString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) {
      console.log("ERROR failed to connect to database", err);
    } else {
      console.log("SUCCESS connected to database");
    }
  },
);

// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// database routes
questRoutes(app);
userRoutes(app);
eventRoutes(app);
serverTimeRoute(app);
fireBaseRoute(app);

// Use the built-in express middleware for serving static files
app.use(express.static("client"));

app.get("/", (req, res) => {
  res.sendFile(path.join(import.meta.dirname + "/client/index.html"));
});

app.listen(PORT, () => console.log(`your server is running on ${PORT}`));

export default app;
