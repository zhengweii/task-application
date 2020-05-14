const { model, Schema } = require("mongoose");
const bcryptjs = require("bcryptjs");

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

userSchema.pre("save", async function() {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcryptjs.hash(user.password, 10);
    }
});

module.exports = model("User", userSchema);
