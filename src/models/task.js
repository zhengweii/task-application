const { model, Schema } = require("mongoose");

const taskSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

module.exports = model("Task", taskSchema);
