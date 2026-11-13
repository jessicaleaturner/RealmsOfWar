import mongoose from "mongoose";
import { EventSchema } from "../models/eventModel.js";
import { UserSchema } from "../models/userModel.js";
import { QuestSchema } from "../models/questModel.js";

const Event = mongoose.model("Event", EventSchema);
const Quest = mongoose.model("Quest", QuestSchema);
const User = mongoose.model("User", UserSchema);

// I don't think I'm going about this correctly
// I need to look at this:
// https://stackoverflow.com/questions/49713135/countdown-timer-with-node-express-cant-access-req-session
// and work out a better solution

export const addNewEvent = (req, res) => {
  // if theres no event of this type for this user
  // add a new event
  let currentEvent = req.body;
  console.log(currentEvent);
};

export const getEvent = (req, res) => {
  let currentEvent = req.body;
  console.log(currentEvent);
};

// admin only route to see timers going on
export const getEvents = (req, res) => {
  let currentEvent = req.body;
  console.log(currentEvent);
};

export const deleteEvent = async (req, res) => {
  // https://mongoosejs.com/docs/queries.html
  try {
    await Event.deleteOne({
      user: req.params.user,
      eventType: req.params.eventType,
    });
    res.json({ message: "Successfully deleted contact" });
  } catch (err) {
    res.send(err);
  }
};

export const performQuest = (req, res) => {
  console.log(req.body);
};
