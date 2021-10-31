import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const {
  web: { client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET },
} = require("../config");

const COOKIE_SECRET = "secret";

// https://www.passportjs.org/docs/google/#oauth-2-0
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(["GoogleStrategy"], { accessToken, refreshToken, profile });

      Promise.resolve(profile)
        .then(({ id, displayName, name, provider }) => ({
          id,
          displayName,
          name,
          provider,
        }))
        .then((user) => done(null, user));
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log(["serializeUser"], user);
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  console.log(["deserializeUser"], obj);
  done(null, obj);
});

export default () =>
  Router()
    .use(
      require("express-session")({
        secret: COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
      })
    )
    .use(require("body-parser").urlencoded({ extended: false }))
    .use(passport.initialize())
    .use(passport.session())
    .get(
      "/auth/google",
      passport.authenticate("google", { scope: ["profile"] })
    )
    .get(
      "/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
      }
    )
    // https://github.com/passport/express-4.x-facebook-example
    .get("/logout", (req, res) => {
      req.logout();
      res.redirect("/");
    });
