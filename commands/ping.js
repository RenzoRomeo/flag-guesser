const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.addStringOption(option => option
			.setName('mensaje')
			.setDescription('Responde con Pong! + mensaje')
			.setRequired(true)),
	async execute(interaction) {
		return interaction.reply('Pong! ' + interaction.options.getString('input'));
	},
};