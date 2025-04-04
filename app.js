/* eslint-disable prefer-destructuring */
require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const MongoStore = require("connect-mongo")(session);

const router = require("./routes/index");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("public", express.static("public"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(flash());

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log("Connected to Database");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

connectToDatabase();

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB Connection Error:", error));

const sessionStore = new MongoStore({
  mongooseConnection: db,
  collection: "session",
});

sessionStore.on("error", (error) => {
  console.error("Session store error:", error);
  console.warn("Using in-memory session store instead.");
});

app.use(
  session({
    secret: process.env.SECRET_KEY || "default-secret",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true },
    store: sessionStore,
  })
);

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success")[0] || null;
  res.locals.errorMsg = req.flash("error")[0] || null;
  next();
});

app.use("/", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App started on http://localhost:${PORT}`);
});
