const { MessageEmbed } = require("discord.js");

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        if (!message.content.toLowerCase().startsWith("f!")) return;
        else{
            // Separar Comando y Contenido en el mensaje
            let stringArr = message.content.split(" ");
            messageCommand = stringArr[0].substring(2).toLowerCase();
            prefixLength = 2 + messageCommand.length;
            // Ahora arguments es un string, pero en el futuro va a ser un array de strings para pasar varios argumentos
            arguments = stringArr.slice(1).join(" ");

            console.log('Command: ' + messageCommand);
            console.log('Arguments: ' + arguments);

            // Detectar comando y llamar función correspondiente
            if (messageCommand == "hola") sayHello(messageConent);
            else if (messageCommand == "reply") await replyWithHello(message, arguments);
            else if (messageCommand == "flag") await sendFlag(message, arguments);
            else if (messageCommand == "play") await playFlags(message);
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

function sayHello(message){
    console.log("Hello "+ message);
}

async function replyWithHello(message, messageContent){
    await message.channel.send(`${message.author.toString()} - ${messageContent}`)
    .then(() => console.log(`Replied to message "${message.content}"`))
    .catch(console.error);
}

async function sendFlag(message, country){
    if (!((country in flagCodes) || (Object.values(flagCodes).map(s => s.toLowerCase())).includes(country.toLowerCase()))){
        await message.channel.send("Invalid country code/name!");
    } else{
        if (!(country in flagCodes)) country = getKeyByValue(flagCodes,country.toLowerCase());
        await message.channel.send({
            files:[`https://flagcdn.com/256x192/${country}.png`],
            content: `${flagCodes[country]}'s flag`,
        });
    }
}

async function playFlags(message){
    if (!isPlaying(message.author.id)){
        currentPlayers[message.author.id] = true;
        const correct = Object.keys(flagCodes)[Math.floor(Math.random() * Object.keys(flagCodes).length)];
        let filter = m => (m.author.id === message.author.id && isPlaying(m.author.id) && m.content.toLowerCase() != 'f!play');
        let correctLength = flagCodes[correct].split(" ").length;
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
                    if (message.content.toLowerCase() === flagCodes[correct].toLowerCase()){
                        message.channel.send(`${message.author.toString()} `.concat(winMessages[Math.floor(Math.random() * winMessages.length)])/* .concat(` ${flagCodes[correct]}`) */);
                    } else{
                        message.channel.send(`${message.author.toString()} `.concat(failMessages[Math.floor(Math.random() * failMessages.length)])/* .concat(` ${flagCodes[correct]}`) */);
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

const flagCodes = {
    "ad": "Andorra",
    "ae": "United Arab Emirates",
    "af": "Afghanistan",
    "ag": "Antigua and Barbuda",
    "ai": "Anguilla",
    "al": "Albania",
    "am": "Armenia",
    "ao": "Angola",
    "aq": "Antarctica",
    "ar": "Argentina",
    "as": "American Samoa",
    "at": "Austria",
    "au": "Australia",
    "aw": "Aruba",
    "ax": "Åland Islands",
    "az": "Azerbaijan",
    "ba": "Bosnia and Herzegovina",
    "bb": "Barbados",
    "bd": "Bangladesh",
    "be": "Belgium",
    "bf": "Burkina Faso",
    "bg": "Bulgaria",
    "bh": "Bahrain",
    "bi": "Burundi",
    "bj": "Benin",
    "bl": "Saint Barthélemy",
    "bm": "Bermuda",
    "bn": "Brunei",
    "bo": "Bolivia",
    "bq": "Caribbean Netherlands",
    "br": "Brazil",
    "bs": "Bahamas",
    "bt": "Bhutan",
    "bv": "Bouvet Island",
    "bw": "Botswana",
    "by": "Belarus",
    "bz": "Belize",
    "ca": "Canada",
    "cc": "Cocos Islands",
    "cd": "DR Congo",
    "cf": "Central African Republic",
    "cg": "Republic of the Congo",
    "ch": "Switzerland",
    "ci": "Ivory Coast",
    "ck": "Cook Islands",
    "cl": "Chile",
    "cm": "Cameroon",
    "cn": "China",
    "co": "Colombia",
    "cr": "Costa Rica",
    "cu": "Cuba",
    "cv": "Cape Verde",
    "cw": "Curaçao",
    "cx": "Christmas Island",
    "cy": "Cyprus",
    "cz": "Czechia",
    "de": "Germany",
    "dj": "Djibouti",
    "dk": "Denmark",
    "dm": "Dominica",
    "do": "Dominican Republic",
    "dz": "Algeria",
    "ec": "Ecuador",
    "ee": "Estonia",
    "eg": "Egypt",
    "eh": "Western Sahara",
    "er": "Eritrea",
    "es": "Spain",
    "et": "Ethiopia",
    "fi": "Finland",
    "fj": "Fiji",
    "fk": "Falkland Islands",
    "fm": "Micronesia",
    "fo": "Faroe Islands",
    "fr": "France",
    "ga": "Gabon",
    "gb": "United Kingdom",
    "gb-eng": "England",
    "gb-nir": "Northern Ireland",
    "gb-sct": "Scotland",
    "gb-wls": "Wales",
    "gd": "Grenada",
    "ge": "Georgia",
    "gg": "Guernsey",
    "gh": "Ghana",
    "gi": "Gibraltar",
    "gl": "Greenland",
    "gm": "Gambia",
    "gn": "Guinea",
    "gp": "Guadeloupe",
    "gq": "Equatorial Guinea",
    "gr": "Greece",
    "gs": "South Georgia",
    "gt": "Guatemala",
    "gu": "Guam",
    "gw": "Guinea-Bissau",
    "gy": "Guyana",
    "hk": "Hong Kong",
    "hm": "Heard Island and McDonald Islands",
    "hn": "Honduras",
    "hr": "Croatia",
    "ht": "Haiti",
    "hu": "Hungary",
    "id": "Indonesia",
    "ie": "Ireland",
    "il": "Israel",
    "im": "Isle of Man",
    "in": "India",
    "io": "British Indian Ocean Territory",
    "iq": "Iraq",
    "ir": "Iran",
    "is": "Iceland",
    "it": "Italy",
    "je": "Jersey",
    "jm": "Jamaica",
    "jo": "Jordan",
    "jp": "Japan",
    "ke": "Kenya",
    "kg": "Kyrgyzstan",
    "kh": "Cambodia",
    "ki": "Kiribati",
    "km": "Comoros",
    "kn": "Saint Kitts and Nevis",
    "kp": "North Korea",
    "kr": "South Korea",
    "kw": "Kuwait",
    "ky": "Cayman Islands",
    "kz": "Kazakhstan",
    "la": "Laos",
    "lb": "Lebanon",
    "lc": "Saint Lucia",
    "li": "Liechtenstein",
    "lk": "Sri Lanka",
    "lr": "Liberia",
    "ls": "Lesotho",
    "lt": "Lithuania",
    "lu": "Luxembourg",
    "lv": "Latvia",
    "ly": "Libya",
    "ma": "Morocco",
    "mc": "Monaco",
    "md": "Moldova",
    "me": "Montenegro",
    "mf": "Saint Martin",
    "mg": "Madagascar",
    "mh": "Marshall Islands",
    "mk": "North Macedonia",
    "ml": "Mali",
    "mm": "Myanmar",
    "mn": "Mongolia",
    "mo": "Macau",
    "mp": "Northern Mariana Islands",
    "mq": "Martinique",
    "mr": "Mauritania",
    "ms": "Montserrat",
    "mt": "Malta",
    "mu": "Mauritius",
    "mv": "Maldives",
    "mw": "Malawi",
    "mx": "Mexico",
    "my": "Malaysia",
    "mz": "Mozambique",
    "na": "Namibia",
    "nc": "New Caledonia",
    "ne": "Niger",
    "nf": "Norfolk Island",
    "ng": "Nigeria",
    "ni": "Nicaragua",
    "nl": "Netherlands",
    "no": "Norway",
    "np": "Nepal",
    "nr": "Nauru",
    "nu": "Niue",
    "nz": "New Zealand",
    "om": "Oman",
    "pa": "Panama",
    "pe": "Peru",
    "pf": "French Polynesia",
    "pg": "Papua New Guinea",
    "ph": "Philippines",
    "pk": "Pakistan",
    "pl": "Poland",
    "pm": "Saint Pierre and Miquelon",
    "pn": "Pitcairn Islands",
    "pr": "Puerto Rico",
    "ps": "Palestine",
    "pt": "Portugal",
    "pw": "Palau",
    "py": "Paraguay",
    "qa": "Qatar",
    "re": "Réunion",
    "ro": "Romania",
    "rs": "Serbia",
    "ru": "Russia",
    "rw": "Rwanda",
    "sa": "Saudi Arabia",
    "sb": "Solomon Islands",
    "sc": "Seychelles",
    "sd": "Sudan",
    "se": "Sweden",
    "sg": "Singapore",
    "sh": "Saint Helena, Ascension and Tristan da Cunha",
    "si": "Slovenia",
    "sj": "Svalbard and Jan Mayen",
    "sk": "Slovakia",
    "sl": "Sierra Leone",
    "sm": "San Marino",
    "sn": "Senegal",
    "so": "Somalia",
    "sr": "Suriname",
    "ss": "South Sudan",
    "st": "São Tomé and Príncipe",
    "sv": "El Salvador",
    "sx": "Sint Maarten",
    "sy": "Syria",
    "sz": "Eswatini",
    "tc": "Turks and Caicos Islands",
    "td": "Chad",
    "tf": "French Southern and Antarctic Lands",
    "tg": "Togo",
    "th": "Thailand",
    "tj": "Tajikistan",
    "tk": "Tokelau",
    "tl": "Timor-Leste",
    "tm": "Turkmenistan",
    "tn": "Tunisia",
    "to": "Tonga",
    "tr": "Turkey",
    "tt": "Trinidad and Tobago",
    "tv": "Tuvalu",
    "tw": "Taiwan",
    "tz": "Tanzania",
    "ua": "Ukraine",
    "ug": "Uganda",
    "un": "United Nations",
    "us": "United States",
    "uy": "Uruguay",
    "uz": "Uzbekistan",
    "va": "Vatican City",
    "vc": "Saint Vincent and the Grenadines",
    "ve": "Venezuela",
    "vg": "British Virgin Islands",
    "vi": "United States Virgin Islands",
    "vn": "Vietnam",
    "vu": "Vanuatu",
    "wf": "Wallis and Futuna",
    "ws": "Samoa",
    "xk": "Kosovo",
    "ye": "Yemen",
    "yt": "Mayotte",
    "za": "South Africa",
    "zm": "Zambia",
    "zw": "Zimbabwe"
};

const winMessages = [
    "Correct! 😎",
]

const failMessages = [
    "You failed LMAO! 😂",
]

let currentPlayers = {}