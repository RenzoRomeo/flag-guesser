const { MessageEmbed } = require("discord.js");
const Flags = require("../flags.js");
const MongoDb = require("../database/mongo-db.js");

const mongoDb = new MongoDb();

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        if (!message.content.toLowerCase().startsWith("f!")) return;
        else{
            // Separar Comando y Contenido en el mensaje
            let stringArr = message.content.split(" ");
            messageCommand = stringArr[0].substring(2).toLowerCase();
            prefixLength = 2 + messageCommand.length;

            // Arguments es un array de strings
            arguments = stringArr.slice(1);

            console.log('Command: ' + messageCommand);
            console.log('Arguments: ' + arguments);

            // Detectar comando y llamar función correspondiente
            if (messageCommand == "flag") await sendFlag(message, arguments);
            else if (messageCommand == "play") await playFlags(message, arguments);
            else if (messageCommand == "help") await showHelp(message);
            else if (messageCommand == "score") await showScore(message);
            else if (messageCommand == "leaderboard") await showLeaderboard(message);
        }
	},
};

function isPlaying(authorId){
    return Object.keys(currentPlayers).includes(authorId);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key].toLowerCase() === value);
}

async function sendFlag(message, arguments){
    country = arguments[0];
    if (!isPlaying(message.author.id)){
        if (!((country in Flags.flagCodes) || (Object.values(Flags.flagCodes).map(s => s.toLowerCase())).includes(country.toLowerCase()))){
            await message.channel.send("Invalid country code/name!");
        } else{
            if (!(country in Flags.flagCodes)) country = getKeyByValue(Flags.flagCodes,country.toLowerCase());
            await message.channel.send({
                files:[`https://flagcdn.com/256x192/${country}.png`],
                content: `${Flags.flagCodes[country]}'s flag`,
            });
        }
    } else{
        await message.channel.send(`${message.author.toString()} - You can't use that command while playing!`);
    }
}

async function playFlags(message, arguments){
    // Detecta dificultad y selecciona objeto correspondiente, si no hay dificultad selecciona todos los paises
    let difficulty = (arguments[0]) ? arguments[0].toLowerCase() : "";
    let difficultyObject = {};
    let points;

    // Lógica dificultades
    if (!difficulty) difficultyObject = Flags.flagCodes;
    else if (difficulty == "e" || difficulty == "easy"){
        difficultyObject = Flags.flagCodesEasy;
        points = 1;
    } else if (difficulty == "m" || difficulty == "medium"){
        difficultyObject = Flags.flagCodesMedium;
        points = 2;
    } else if (difficulty == "h" || difficulty == "hard"){
        difficultyObject = Flags.flagCodesHard
        points = 3;
    }else {
        message.channel.send(`${message.author.toString()} `.concat("Difficulty doesn't exist!"));
        return;
    }

    if (!isPlaying(message.author.id)){

        // Guarda el ID del autor en objeto de currentPlayers
        currentPlayers[message.author.id] = true; 

        // Elige país correcto
        const correct = Object.keys(difficultyObject)[Math.floor(Math.random() * Object.keys(difficultyObject).length)];

        // Filtro para awaitMessages, espera respuesta del autor original
        let filter = m => (m.author.id === message.author.id && isPlaying(m.author.id) && !['f!play', 'f!flag'].includes(m.content.toLowerCase().split(" ")[0]));
        let correctLength = difficultyObject[correct].split(" ").length;

        try{
            await message.channel.send({
                files:[`https://flagcdn.com/256x192/${correct}.png`],
                content: `${message.author.toString()} Guess this country's name! - Hint: ${correctLength} word${(correctLength>1) ? 's' : ''} - You have 10 seconds!`
            })
            .then(message.channel.awaitMessages({
                filter,
                max: 1,
                time: 10000,
                errors: ['time']})
                .then(async message => {
                    message = message.first();
                    if (message.content.toLowerCase() === difficultyObject[correct].toLowerCase()){
                        message.channel.send(`${message.author.toString()} `.concat(winMessages[Math.floor(Math.random() * winMessages.length)]));
                        mongoDb.updateUserScore(message.author.id.toString(), message.guild.id.toString(), points, true);
                    } else{
                        message.channel.send(`${message.author.toString()} `.concat(failMessages[Math.floor(Math.random() * failMessages.length)]));
                    }
                    delete currentPlayers[message.author.id];
                }).catch(e => {
                    message.channel.send(`${message.author.toString()} - Times up!`);
                    delete currentPlayers[message.author.id];
                })
            );
        } catch(e) {
            console.error(e);
        }
    } else{
        message.channel.send(`${message.author.toString()} `.concat('You are already playing!'));
    }
}

async function showHelp(message){
    let embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Flag Guesser Help')
    .setDescription('List of commands')
    .addFields(
        {name: 'f!play [easy/medium/hard]', value: 'Play Flag Guesser'},
        {name: 'f!flag [country code/name]', value: "Show the country's flag "}
    )
    await message.channel.send({embeds: [embed]});
}

async function showScore(message){
    let playerScore = await mongoDb.getUserScore(message.author.id, true);
    if (!playerScore){
        message.channel.send(`${message.author.toString()} `.concat("You haven't played any games yet!"));
        return;
    } else{
        message.channel.send(`${message.author.toString()} `.concat(`Your single player score is ${playerScore}!`));
    }
}

async function showLeaderboard(message){
    let leaderboard = await mongoDb.getGuildLeaderboard(message.guild.id.toString(), true);
    let messageValues = [];

    for (let user in leaderboard){
        let bruh = message.guild.members.cache.get(user).user;
        messageValues.push({name: bruh.username.concat(`#${bruh.discriminator}`), value: leaderboard[user].toString()});
    }

    console.log(messageValues);

    messageValues.sort((a, b) => {
        return parseInt(b.value) - parseInt(a.value);
    });

    let embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Flag Guesser Leaderboard')
    .setDescription('Player List')
    .addFields(...messageValues);
    await message.channel.send({embeds: [embed]});
}

const winMessages = [
    "Correct! 😎",
]

const failMessages = [
    "You failed LMAO! 😂",
]

let currentPlayers = {}