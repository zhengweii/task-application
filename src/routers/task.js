const { Router } = require("express");

// Local imports
const Task = require("../models/task");

const router = new Router();

// Create a new task
router.post("/task", (req, res) => {
    const task = new Task(req.body);

    task.save()
            .then(task => {
                res.status(201).send(task);
            })
            .catch(error => {
                console.log("Failed to create task", error);
                res.status(500).send(error);
            });
});

// Read all tasks
router.get("/tasks", (req, res) => {
    Task.find({})
            .then(tasks => {
                if (tasks.length === 0) {
                    return res.status(404).send("No tasks in database");
                }

                res.send(tasks);
            })
            .catch(error => {
                console.log("Failed to read all tasks", error);
                res.status(500).send(error);
            });
});

// Read a specific task by id
router.get("/tasks/:id", (req, res) => {
    const _id = req.params.id;

    Task.findOne({ _id })
            .then(task => {
                if (!task) {
                    return res.status(404).send("No such task exists");
                }

                res.send(task);
            })
            .catch(error => {
                console.log("Failed to read task", error);
                res.status(500).send(error);
            });
});

// Update a specific task by id
router.patch("/tasks/:id", (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update" });
    }

    Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .then(task => {
                if (!task) {
                    return res.status(404).send("No such task exists");
                }

                res.send(task);
            })
            .catch(error => {
                console.log("Failed to update task", error);
                res.status(500).send(error);
            });
});

// Delete a specific task by id
router.delete("/tasks/:id", (req, res) => {
    Task.findByIdAndDelete(req.params.id)
            .then(task => {
                if (!task) {
                    return res.status(404).send("No such task exists");
                }

                res.send(task);
            })
            .catch(error => {
                console.log("Failed to delete task", error);
                res.status(500).send(error);
            });
});

module.exports = router;
