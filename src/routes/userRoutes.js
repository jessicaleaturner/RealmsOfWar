import {
  getUsers,
  addNewUser,
  getUserByToken,
  updateUser,
  deleteUser,
  getUsersDetails,
} from "../controllers/userController.js";

const userRoutes = (app) => {
  app
    .route("/user")
    .get((req, res, next) => {
      // making it all safe
      if (!req.headers["accept"].includes("application/json", 0)) {
        res.redirect("/");
      } else {
        next();
      }
    }, getUsers)
    // POST endpoint
    .post(addNewUser);

  app.route("/userDetails").get(getUsersDetails);

  app
    .route("/user/:token")
    // get specific contact
    .get(getUserByToken)
    // put request
    .put(updateUser)
    // delete request
    .delete(deleteUser);
};

export default userRoutes;
