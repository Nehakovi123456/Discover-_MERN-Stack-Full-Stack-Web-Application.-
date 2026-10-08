
const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: false, 
            },
            file: {
                url: String,
                fileName: String,
                fileType: String,
            },
        },
        users: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: [true, "Users array is required"],
            validate: {
                validator: function (v) {
                    return v.length === 2;
                },
                message: "Users array must contain exactly 2 user IDs",
            },
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender ID is required"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Message", MessageSchema);


