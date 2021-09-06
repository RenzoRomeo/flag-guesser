const Transaction = require("mongoose-transactions");
const { connectionUri } = require("../config.json");
const transaction = new Transaction();
const mongoose = require("mongoose");
const UserSchema = require("./user-schema");

class MongoDb{

    async initialize() {
        try {
            await mongoose.connect(connectionUri);
        console.log("DB is connected");
        } catch (err) {
            console.error(err);
        }
    }

    async createUser(userId, guildId){
        let existentUser = await UserSchema.findOne({userId});

        if (existentUser){
            return existentUser;
        }

        let newUser = new UserSchema({
            userId: userId,
            guildId: guildId,
            singleScore: 0,
            battleScore: 0
        });
        
        return await newUser.save();
    }

    async updateUserScore(userId, guildId, addScore, single){
        let existentUser = await this.createUser(userId, guildId);

        if (single) existentUser.singleScore += addScore;
        else existentUser.battleScore += addScore;

        return await this.updateUser(existentUser);
    }

    // Debe existir el usuario
    async updateUser(user){
        console.log(user);
        await UserSchema.findOneAndUpdate({userId: user.userId}, user);
    }

    async getUserScore(userId, single){
        let existentUser = await UserSchema.findOne({userId});

        if (!existentUser) return null;

        return (single) ? existentUser.singleScore : existentUser.battleScore;
    }

    async getGuildLeaderboard(guildId, single){
        let leaderboard = {};
        let users = await UserSchema.find({guilId: guildId});
        for (let user of users) leaderboard[user.userId] = (single) ? user.singleScore : user.battleScore;
        return leaderboard;
    }
}

module.exports =  MongoDb;