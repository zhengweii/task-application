const { Router } = require("express");
const multer = require("multer");

// Local imports
const auth = require("../middleware/auth");
const User = require("../models/user");
const Task = require("../models/task");

// Constants
const MAX_FILE_SIZE = 1000000;
const UPLOAD = multer({
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("Please select an image"));
        }

        cb(undefined, true);
    }
});

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
        // Ensures that all tasks associated with the user are deleted as well
        await Task.deleteMany({ owner: user._id });
        await user.remove();
        res.send(user);
    }
    catch (error) {
        console.log("Failed to delete account", error);
        res.status(500).send({ error: "Failed to delete account" });
    }
});

router.post("/my-account/profile-picture", auth, UPLOAD.single("picture"),
        async (req, res, next) => {
            const { file, user } = req;

            if (!file) {
                return next(new Error("Please select a file"));
            }

            try {
                user.profilePicture = file.buffer;
                await user.save();
                res.send(user);
            }
            catch (error) {
                console.log("Failed to upload profile picture", error);
                res.status(500).send({ error: "Failed to upload profile picture" });
            }
        }, (error, req, res, next) => {
            res.status(400).send({ error: error.message });
        });

router.get("/users/:id/profile-picture", async (req, res) => {
    try {
        const _id = req.params.id;
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).send({ error: "No such user exists" });
        }

        if (!user.profilePicture) {
            return res.status(404).send({ error: "User does not have a profile picture" });
        }

        res.set("Content-Type", "image/jpg").send(user.profilePicture);
    }
    catch (error) {
        console.log("Failed to get profile picture", error);
        res.status(500).send({ error: "Failed to get profile picture" });
    }
});

router.delete("/my-account/profile-picture", auth, async (req, res) => {
    const { user } = req;

    try {
        user.profilePicture = undefined;
        await user.save();
        res.send(user);
    }
    catch (error) {
        console.log("Failed to delete profile picture", error);
        res.status(500).send({ error: "Failed to delete profile picture" });
    }
});

module.exports = router;
