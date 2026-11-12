"use strict";

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";

import questRoutes from "./src/routes/questRoutes";
import userRoutes from "./src/routes/userRoutes";
import eventRoutes from "./src/routes/eventRoutes";
import serverTimeRoute from "./src/routes/serverTimeRoute";
import fireBaseRoute from "./src/routes/fireBaseRoute";

const app = express();
const PORT = process.env.PORT || 8080;

// mongoose connection
// IMPORTANT!: Make sure to have env file set up! Check documentation!
require("dotenv").config();
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
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

app.listen(PORT, () => console.log(`your server is running on ${PORT}`));

export default app;
module.exports = { app };
