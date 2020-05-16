const { model, Schema } = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    },
    profilePicture: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
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
        throw new Error("Please provide a valid email and password");
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Please provide a valid email and password");
    }

    return user;
};

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.profilePicture;
    return userObject;
};

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ userID: user._id.toString() }, "SECRETKEY");

    // Save token to the array
    user.tokens.push({ token });
    await user.save();
    return token;
};

const User = model("User", userSchema);

module.exports = User;
