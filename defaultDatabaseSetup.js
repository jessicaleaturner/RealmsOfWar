"use strict";

import mongoose from "mongoose";
import dotenv from "dotenv";

import setupDatabase from "./src/controllers/setupController.js";

dotenv.config({ quiet: true });
let uriString = process.env.MONGOLAB_BLACK_URI || process.env.MONGO;

try {
  await mongoose.connect(uriString);
  console.log("SUCCESS connected to database");
  await setupDatabase();
} catch (err) {
  console.log("ERROR failed to set up database", err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
