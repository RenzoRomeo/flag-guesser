const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    userId: String, // message.author.id
    guildIds: Array,
    singleScore: Number,
    battleScore: Number
});

module.exports = mongoose.model("User", UserSchema);