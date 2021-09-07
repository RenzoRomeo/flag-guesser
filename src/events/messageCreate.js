const { MessageEmbed } = require("discord.js");
const Flags = require("../flags.js");
const MongoDb = require("../database/mongo-db.js");

const mongoDb = new MongoDb();

const embedColor = "#0099ff";

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

            /* console.log('Command: ' + messageCommand);
            console.log('Arguments: ' + arguments); */

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
    let embed = new MessageEmbed()
    .setColor(embedColor)
    .setTitle(`${message.author.username}#${message.author.discriminator}`)

    country = arguments.join(" ");
    if (!isPlaying(message.author.id)){
        if (!((country in Flags.flagCodes) || (Object.values(Flags.flagCodes).map(s => s.toLowerCase())).includes(country.toLowerCase()))){
            embed.setDescription("Invalid country code/name!")
        } else{
            if (!(country in Flags.flagCodes)) country = getKeyByValue(Flags.flagCodes,country.toLowerCase());
            embed.setDescription(`${Flags.flagCodes[country]}'s flag`)
            .setImage(`https://flagcdn.com/256x192/${country}.png`);
        }
        await message.channel.send({embeds: [embed]});
    } else{
        await message.channel.send(`${message.author.toString()} - You can't use that command while playing!`);
    }
}

async function playFlags(message, arguments){
    // Detecta dificultad y selecciona objeto correspondiente, si no hay dificultad selecciona todos los paises
    let difficulty = (arguments[0]) ? arguments[0].toLowerCase() : "";
    let difficultyObject = {};
    let points;

    let embed = new MessageEmbed()
    .setColor(embedColor)
    .setTitle(`${message.author.username}#${message.author.discriminator}`)

    // Lógica dificultades
    if (!difficulty){
        difficultyObject = Flags.flagCodes;
        points = 1;
    } else if (difficulty == "e" || difficulty == "easy"){
        difficultyObject = Flags.flagCodesEasy;
        points = 1;
    } else if (difficulty == "m" || difficulty == "medium"){
        difficultyObject = Flags.flagCodesMedium;
        points = 2;
    } else if (difficulty == "h" || difficulty == "hard"){
        difficultyObject = Flags.flagCodesHard
        points = 3;
    }else {
        await message.channel.send({embeds: [embed.setDescription("Difficulty doesn't exist!")]});
        return;
    }

    if (!isPlaying(message.author.id)){

        // Guarda el ID del autor en objeto de currentPlayers
        currentPlayers[message.author.id] = true; 

        // Elige país correcto
        const correct = Object.keys(difficultyObject)[Math.floor(Math.random() * Object.keys(difficultyObject).length)];

        // Filtro para awaitMessages, espera respuesta del autor original
        let filter = m => (m.author.id === message.author.id && isPlaying(m.author.id) && !['f!play', 'f!flag', 'f!leaderboard', 'f!help', 'f!score'].includes(m.content.toLowerCase().split(" ")[0]));
        let correctLength = difficultyObject[correct].split(" ").length;

        try{
            await message.channel.send({embeds: [embed.setDescription(`Guess this country's name!\nHint: ||${correctLength} word${(correctLength>1) ? 's' : ''}||\n`)
            .setFooter("You have 10 seconds!")
            .setImage(`https://flagcdn.com/256x192/${correct}.png`)]})
            .then(message.channel.awaitMessages({
                filter,
                max: 1,
                time: 10000,
                errors: ['time']})
                .then(async message => {
                    message = message.first();
                    if (message.content.toLowerCase() === difficultyObject[correct].toLowerCase()){
                        message.channel.send({embeds: [embed.setFooter("").setImage("").setDescription(``.concat(winMessages[Math.floor(Math.random() * winMessages.length)]))]})
                        mongoDb.updateUserScore(message.author.id.toString(), message.guild.id.toString(), points, true);
                    } else{
                        message.channel.send({embeds: [embed.setFooter("").setImage("").setDescription(``.concat(failMessages[Math.floor(Math.random() * failMessages.length)]))]})
                    }
                    delete currentPlayers[message.author.id];
                }).catch(e => {
                    message.channel.send({embeds: [embed.setFooter("").setImage("").setDescription(`Times up!`)]})
                    delete currentPlayers[message.author.id];
                })
            );
        } catch(e) {
            console.error(e);
        }
    } else{
        message.channel.send({embeds: [embed.setImage("").setDescription(``.concat('You are already playing!'))]})
    }
}

async function showHelp(message){
    let embed = new MessageEmbed()
    .setColor(embedColor)
    .setTitle('Flag Guesser Help')
    .setDescription('List of commands')
    .addFields(
        {name: 'f!play [easy(1pt)/medium(2pt)/hard(3pt)]', value: 'Play Flag Guesser'},
        {name: 'f!flag [country code/name]', value: "Show the country's flag "},
        {name: 'f!score', value: 'Show single player score'},
        {name: 'f!leaderboard', value: "Show this server's leaderboard"}
    )
    await message.channel.send({embeds: [embed]});
}

async function showScore(message){
    let playerScore = await mongoDb.getUserScore(message.author.id, true);
    let embed = new MessageEmbed()
    .setColor(embedColor)
    .setTitle(`${message.author.username}#${message.author.discriminator}`)

    if (!playerScore){
        message.channel.send({embeds: [embed.setDescription(``.concat("You haven't played any games yet!"))]});
    } else{
        message.channel.send({embeds: [embed.setDescription(``.concat(`Your single player score is ${playerScore}`))]});
    }
}

async function showLeaderboard(message){
    let guildUsers = [];
    for (let u of await message.guild.members.list({limit: 100})) guildUsers.push(u[0]);
    let leaderboard = await mongoDb.getGuildLeaderboard(message.guildId.toString(), guildUsers, true);
    let values = [];

    for (let user in leaderboard){
        let bruh = message.guild.members.cache.get(user).user;
        values.push(bruh.username.concat(`#${bruh.discriminator}`).concat(` - ${leaderboard[user].toString()}`));
    }

    values.sort((a, b) => {
        return parseInt(b.split(" ")[b.split(" ").length-1]) - parseInt(a.split(" ")[a.split(" ").length-1]); 
    })

    for (let i in values){
        values[i] = `**${(parseInt(i)+1)}.** ${values[i]}`
    }

    let embed = new MessageEmbed()
    .setColor(embedColor)
    .setAuthor(`${message.guild.name}'s Leaderboard`, message.guild.iconURL())
    .addFields({name: "\u200b", value: values.join('\n')})
    await message.channel.send({embeds: [embed]});
}

const winMessages = [
    "Correct! 😎",
]

const failMessages = [
    "You failed LMAO! 😂",
]

let currentPlayers = {}