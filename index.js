"use strict";

import express from "express";
import mongoose from "mongoose";
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
dotenv.config({ quiet: true });
let uriString = process.env.MONGOLAB_BLACK_URI || process.env.MONGO;
mongoose
  .connect(uriString)
  .then(() => console.log("SUCCESS connected to database"))
  .catch((err) => console.log("ERROR failed to connect to database", err));

// body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// database routes
questRoutes(app);
userRoutes(app);
eventRoutes(app);
serverTimeRoute(app);
fireBaseRoute(app);

// Use the built-in express middleware for serving static files
app.use(express.static("client"));
// Axios is installed from npm and served to the client from node_modules
app.use(
  "/vendor/axios",
  express.static(path.join(import.meta.dirname, "node_modules/axios/dist/esm")),
);

app.get("/", (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "client/index.html"));
});

// only listen when run directly, so tests can import the app
if (import.meta.main) {
  app.listen(PORT, () => console.log(`your server is running on ${PORT}`));
}

export default app;
