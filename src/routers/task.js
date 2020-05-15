const { Router } = require("express");

// Local imports
const auth = require("../middleware/auth");
const Task = require("../models/task");

const router = new Router();

// Create a new task
router.post("/task", auth, async (req, res) => {
    try {
        const { body, user } = req;

        const task = new Task({ ...body, owner: user._id });
        await task.save();
        res.status(201).send(task);
    }
    catch (error) {
        console.log("Failed to create task", error);
        res.status(500).send({ error: "Failed to create task" });
    }
});

// Read all tasks
router.get("/tasks", auth, async (req, res) => {
    try {
        const { user } = req;

        const tasks = await Task.find({ owner: user._id });
        if (tasks.length === 0) {
            return res.status(404).send({ error: "User does not have any tasks" });
        }
        res.send(tasks);
    }
    catch (error) {
        console.log("Failed to read all tasks", error);
        res.status(500).send({ error: "Failed to read all tasks" });
    }
});

// Read a specific task by id
router.get("/tasks/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const { user } = req;

        const task = await Task.findOne({ _id, owner: user._id });
        if (!task) {
            return res.status(404).send({ error: "No such task exists" });
        }
        res.send(task);
    }
    catch (error) {
        console.log("Failed to read task", error);
        res.status(500).send({ error: "Failed to read task" });
    }
});

// Update a specific task by id
router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update" });
    }

    try {
        const _id = req.params.id;
        const { body, user } = req;

        const task = await Task.findOne({ _id, owner: user._id });
        if (!task) {
            return res.status(404).send({ error: "No such task exists" });
        }
        updates.forEach(update => task[update] = body[update]);
        await task.save();
        res.send(task);
    }
    catch (error) {
        console.log("Failed to update task", error);
        res.status(500).send({ error: "Failed to update task" });
    }
});

// Delete a specific task by id
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const { user } = req;

        const task = await Task.findOneAndDelete({ _id, owner: user._id });
        if (!task) {
            return res.status(404).send({ error: "No such task exists" });
        }
        res.send(task);
    }
    catch (error) {
        console.log("Failed to delete task", error);
        res.status(500).send({ error: "Failed to delete task" });
    }
});

module.exports = router;
