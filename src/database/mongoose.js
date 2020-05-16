const mongoose = require("mongoose");

const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error"));

db.once("open", () => {
    console.log("Connected to database");
});
