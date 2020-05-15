const { Router } = require("express");

// Local imports
const auth = require("../middleware/auth");
const User = require("../models/user");

const router = new Router();

router.post("/sign-up", async (req, res) => {
    try {
        const { body } = req;
        const user = new User(body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (error) {
        console.log("Failed to sign up", error);
        res.status(500).send({ error: error.message });
    }
});

router.post("/sign-in", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.signInWithEmailAndPassword(email, password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    }
    catch (error) {
        console.log("Failed to sign in", error);
        res.status(401).send({ error: error.message });
    }
});

router.post("/sign-out", auth, async (req, res) => {
    try {
        const { user, token } = req;
        user.tokens = user.tokens.filter(each => each.token !== token);
        await user.save();
        res.send();
    }
    catch (error) {
        console.log("Failed to sign out", error);
        res.status(500).send({ error: "Failed to sign out" });
    }
});

router.post("/sign-out-all", auth, async (req, res) => {
    try {
        const { user } = req;
        user.tokens = [];
        await user.save();
        res.send();
    }
    catch (error) {
        console.log("Failed to sign out from all sessions", error);
        res.status(500).send({ error: "Failed to sign out from all sessions" });
    }
});

router.get("/my-account", auth, async (req, res) => {
    const { user } = req;
    res.send(user);
});

router.patch("/my-account", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["password"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update" });
    }

    try {
        const { body, user } = req;
        updates.forEach(update => user[update] = body[update]);
        await user.save();
        res.send(user);
    }
    catch (error) {
        console.log("Failed to update user", error);
        res.status(500).send({ error: "Failed to update user" });
    }
});

router.delete("/my-account", auth, async (req, res) => {
    try {
        const { user } = req;
        await user.remove();
        res.send(user);
    }
    catch (error) {
        console.log("Failed to delete account", error);
        res.status(500).send({ error: "Failed to delete account" });
    }
});

module.exports = router;
