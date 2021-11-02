import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

const {
  // https://console.cloud.google.com/
  web: { client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET },
  // https://github.com/settings/applications/new
  github: { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET },
} = require("../config");

const COOKIE_SECRET = "secret";
const JWT_SECRET = "secret";

const User = {
  findOne: ({ id }, done) => done(null, { id, name: `User #${id}` }),
  findOrCreate: (
    { id, displayName, name, username, profileUrl, provider },
    done
  ) =>
    done(
      null,
      {
        github: {
          id,
          displayName,
          username,
          profileUrl,
          provider,
        },
      }[provider] || {
        id,
        displayName,
        name,
        provider,
      }
    ),
};

// https://www.passportjs.org/docs/google/#oauth-2-0
passport
  .use(
    // http://www.passportjs.org/packages/passport-google-oauth20/
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        console.log(["GoogleStrategy"], { accessToken, refreshToken, profile });

        User.findOrCreate(profile, function (err, user) {
          return done(err, user);
        });
      }
    )
  )
  .use(
    // http://www.passportjs.org/packages/passport-github/
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/github/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        console.log(["GitHubStrategy"], { accessToken, refreshToken, profile });

        User.findOrCreate(profile, function (err, user) {
          return done(err, user);
        });
      }
    )
  )
  .use(
    // https://github.com/mikenicholson/passport-jwt#configure-strategy
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      function (jwt_payload, done) {
        console.log(["JwtStrategy"], { jwt_payload });

        User.findOne({ id: jwt_payload.sub }, function (err, user) {
          return done(err, user);
        });
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
    .get("/auth/github", passport.authenticate("github"))
    .get(
      "/auth/github/callback",
      passport.authenticate("github", { failureRedirect: "/login" }),
      function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
      }
    )
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
    .get("/login", (req, res) => {
      req.logout();
      res.redirect("/");
    })
    // https://github.com/passport/express-4.x-facebook-example
    .get("/logout", (req, res) => {
      req.logout();
      res.redirect("/");
    })
    // https://github.com/mikenicholson/passport-jwt#authenticate-requests
    .get(
      "/jwt/profile",
      passport.authenticate("jwt", { session: false }),
      (req, res) => {
        res.send(req.user);
      }
    )
    .get("/jwt/login/:id", (req, res, next) => {
      const { id } = req.params;
      User.findOne({ id }, function (_err, user) {
        req.login(user, { session: false }, async (err) => {
          if (err) return next(err);

          const token = jwt.sign({ sub: user.id }, JWT_SECRET);

          return res.json({ token });
        });
      });
    });
