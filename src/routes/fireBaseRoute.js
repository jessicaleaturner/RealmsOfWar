import dotenv from "dotenv";
dotenv.config();

const fireBaseRoute = (app) => {
  app.route("/firebase").get((req, res, next) => {
    // making it all safe
    if (!req.headers["accept"].includes("application/json", 0)) {
      res.redirect("/");
    } else {
      next();
    }
  }, createFireBase);
};

const createFireBase = (req, res) => {
  let firebase = {
    apiKey: process.env.FB_APIKEY,
    authDomain: process.env.FB_AUTHDOMAIN,
    databaseURL: process.env.FB_DBURL,
    projectId: process.env.FB_PID,
    storageBucket: process.env.FB_SB,
    messagingSenderId: process.env.FB_MSI,
    appId: process.env.FB_AID,
    measurementId: process.env.FB_MID,
  };
  res.json(firebase);
};

export default fireBaseRoute;
