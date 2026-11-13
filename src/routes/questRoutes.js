import {
  getQuests,
  addNewQuest,
  getQuestById,
  updateQuest,
  deleteQuest,
} from "../controllers/questController.js";

const questRoutes = (app) => {
  app
    .route("/quest")
    .get((req, res, next) => {
      // middleware
      console.log(`Request from: ${req.originalUrl}`);
      console.log(`Request type: ${req.method}`);
      next();
    }, getQuests)
    // POST endpoint
    .post(addNewQuest);

  app
    .route("/quest/:id")
    // get specific contact
    .get(getQuestById)
    // put request
    .put(updateQuest)
    // delete request
    .delete(deleteQuest);
};

export default questRoutes;
