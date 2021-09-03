function sayHello(message){
    console.log("Hello "+ message);
}

async function replyWithHello(message, messageContent){
    await message.channel.send(`${message.author.toString()} - ${messageContent}`)
    .then(() => console.log(`Replied to message "${message.content}"`))
    .catch(console.error);
}


module.exports = {
	name: 'messageCreate',
	async execute(message) {
        if (!message.content.startsWith("f!")) return;
        else{
            let stringArr = message.content.split(" ");
            messageCommand = stringArr[0].substring(2);
            prefixLength = 2 + messageCommand.length;
            messageContent = stringArr.slice(1).join(" ");

            console.log(messageCommand);
            console.log(messageContent);

            if (messageCommand == "hola") sayHello(messageConent);
            else if (messageCommand == "reply") await replyWithHello(message, messageContent);
        }
	},
};