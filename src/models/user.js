const { model, Schema } = require("mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = model("User", userSchema);
