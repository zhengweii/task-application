const { model, Schema } = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
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

userSchema.statics.signInWithEmailAndPassword = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Failed to sign in");
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Failed to sign in");
    }

    return user;
};

const User = model("User", userSchema);

module.exports = User;
