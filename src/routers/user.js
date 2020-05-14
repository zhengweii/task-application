const { Router } = require("express");

// Local imports
const User = require("../models/user");

const router = new Router();

// Create a new user
router.post("/user", (req, res) => {
    const user = new User(req.body);

    user.save()
            .then(user => {
                res.status(201).send(user);
            })
            .catch(error => {
                console.log("Failed to create user", error);
                res.status(500).send(error);
            });
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.signInWithEmailAndPassword(email, password);
        console.log("Successfully signed in");
        res.send(user);
    }
    catch (error) {
        console.log("Failed to sign in", error);
        res.status(401).send({ error: error.message });
    }
});

// Read all users
router.get("/users", (req, res) => {
    User.find({})
            .then(users => {
                if (users.length === 0) {
                    return res.status(404).send("No users in database");
                }

                res.send(users);
            })
            .catch(error => {
                console.log("Failed to read all users", error);
                res.status(500).send(error);
            });
});

// Read a specific user by email
router.get("/users/:email", (req, res) => {
    const email = req.params.email;

    User.findOne({ email })
            .then(user => {
                if (!user) {
                    return res.status(404).send("No such user exists");
                }

                res.send(user);
            })
            .catch(error => {
                console.log("Failed to read user", error);
                res.status(500).send(error);
            });
});

// Update a specific user by id
router.patch("/users/:id", (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["email", "password"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update" });
    }

    User.findById(req.params.id)
            .then(user => {
                if (!user) {
                    return res.status(404).send("No such user exists");
                }

                updates.forEach(update => user[update] = req.body[update]);
                return user.save();
            })
            .then(user => {
                console.log("Successfully updated user");
                res.send(user);
            })
            .catch(error => {
                console.log("Failed to update user", error);
                res.status(500).send(error);
            });
});

// Delete a specific user by id
router.delete("/users/:id", (req, res) => {
    User.findByIdAndDelete(req.params.id)
            .then(user => {
                if (!user) {
                    return res.status(404).send("No such user exists");
                }

                res.send(user);
            })
            .catch(error => {
                console.log("Failed to delete user", error);
                res.status(500).send(error);
            });
});

module.exports = router;
