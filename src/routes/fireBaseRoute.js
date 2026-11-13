import dotenv from "dotenv";
dotenv.config({ quiet: true });

const fireBaseRoute = (app) => {
  app.route("/firebase").get((req, res, next) => {
    // making it all safe
    if (!(req.headers["accept"] || "").includes("application/json")) {
      res.redirect("/");
    } else {
      next();
    }
  }, createFireBase);
};

const createFireBase = (req, res) => {
  let firebase = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };
  res.json(firebase);
};

export default fireBaseRoute;
