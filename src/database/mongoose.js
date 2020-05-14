const mongoose = require("mongoose");

const url = "YOUR_URL";

mongoose.connect(url, {
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
