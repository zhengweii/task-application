const jwt = require("jsonwebtoken");

// Local imports
const User = require("../models/user");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = async (req, res, next) => {
    try {
        console.log("Calling auth middleware");
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        const user = await User.findOne({ _id: decoded.userID, "tokens.token": token });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.log("Failed to authenticate user", error);
        res.status(401).send({ error: "Please authenticate" });
    }
};
