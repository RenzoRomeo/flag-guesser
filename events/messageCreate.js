const { MessageEmbed } = require("discord.js");
const Flags = require("../flags.js");

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
    if (!difficulty) difficultyObject = Flags.flagCodes;
    else if (difficulty == "easy") difficultyObject = Flags.flagCodesEasy;
    else if (difficulty == "med" || difficulty == "medium") difficultyObject = Flags.flagCodesMedium;
    else if (difficulty == "hard") difficultyObject = Flags.flagCodesHard;
    else{
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
                .then(message => {
                    message = message.first();
                    if (message.content.toLowerCase() === difficultyObject[correct].toLowerCase()){
                        message.channel.send(`${message.author.toString()} `.concat(winMessages[Math.floor(Math.random() * winMessages.length)])/* .concat(` ${Flags.flagCodes[correct]}`) */);
                    } else{
                        message.channel.send(`${message.author.toString()} `.concat(failMessages[Math.floor(Math.random() * failMessages.length)])/* .concat(` ${Flags.flagCodes[correct]}`) */);
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
        {name: 'f!play', value: 'Play Flag Guesser'},
        {name: 'f!flag [country code/name]', value: "Show the country's flag "}
    )
    await message.channel.send({embeds: [embed]});
}

const winMessages = [
    "Correct! 😎",
]

const failMessages = [
    "You failed LMAO! 😂",
]

let currentPlayers = {}