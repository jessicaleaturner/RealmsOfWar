import {
  addNewEvent,
  getEvent,
  getEvents,
  deleteEvent,
  performQuest,
} from "../controllers/eventController.js";

const eventRoutes = (app) => {
  app.route("/performQuest").post(performQuest);

  app.route("/event/:id").get(getEvent).delete(deleteEvent);

  app.route("/event").get(getEvents).post(addNewEvent);
};

export default eventRoutes;
