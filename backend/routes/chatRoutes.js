

const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/addmsg", authMiddleware, async (req, res) => {
    const { from, to, message, file } = req.body;
    try {
        const newMessage = await Message.create({
            message: {
                text: message,
                file: file || null,
            },
            users: [from, to],
            sender: from,
        });

        return res.status(201).json({
            success: true,
            msg: "Message added successfully.",
            message: newMessage,
        });
    } catch (error) {
        console.error("Error adding message:", error);
        return res.status(500).json({ success: false, msg: "Failed to add message", error: error.message });
    }
});

router.post("/getmsg", async (req, res) => {
  try {
    const { from, to } = req.body;

    const messages = await Message.find({
      users: { $all: [from, to] },
    }).sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      message: { text: msg.message.text, file: msg.message.file },
      sender: msg.sender,
      createdAt: msg.createdAt,
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(200).json({
        url: fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
    });
});

module.exports = router;
