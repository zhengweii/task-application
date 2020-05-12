const express = require("express");

// Local imports
require("./database/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
