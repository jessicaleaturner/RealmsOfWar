import mongoose from "mongoose";
import { EventSchema } from "../models/eventModel";
import { UserSchema } from "../models/userModel";
import { QuestSchema } from "../models/questModel";

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

export const deleteEvent = (req, res) => {
  // https://mongoosejs.com/docs/queries.html
  Event.deleteOne(
    { user: req.params.user, eventType: req.params.eventType },
    (err, event) => {
      if (err) {
        res.send(err);
      }
      res.json({ message: "Successfully deleted contact" });
    },
  );
};

export const performQuest = (req, res) => {
  console.log(req.body);
};
