require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder  } = require('discord.js');

// Init client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const prefix = '!';

client.once('ready', () => {
    console.log(`${client.user.tag} est en ligne !`);
});

// Roll Dices
function rollDice(diceCount, diceSides) {
    let total = 0;
    const rolls = [];

    for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * diceSides) + 1;
        rolls.push(roll);
        total += roll;
    }

    return { rolls, total };
}

// Listen Message
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'bonjour') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`A ton tour`)
            .setDescription(`Salut <@${message.author.id}> ! Choisis un bouton :`)

        const button1 = new ButtonBuilder()
            .setCustomId('answer1')
            .setLabel('⚔️ Attaque')
            .setStyle(ButtonStyle.Danger);

        const button2 = new ButtonBuilder()
            .setCustomId('answer2')
            .setLabel('🔮 Sorts')
            .setStyle(ButtonStyle.Primary);

        const button3 = new ButtonBuilder()
            .setCustomId('answer3')
            .setLabel('▶️ Passer')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(button1, button2, button3);
        
        const buttonMessage = await message.channel.send({
            embeds: [embed],
            components: [row],
        });
    } else if (command === 'roll') {
        const dicePattern = /^(\d*)d(\d+)$/;
        const diceInput = args[0];

        if (!diceInput || !dicePattern.test(diceInput)) {
            message.channel.send("Utilisation correcte : `!roll XdY` (ex: `!roll 2d8` pour lancer 2 dés à 8 faces)");
            return;
        }
        const [, diceCount, diceSides] = diceInput.match(dicePattern);
        const count = diceCount === '' ? 1 : parseInt(diceCount);
        const sides = parseInt(diceSides);

        if (count <= 0 || sides <= 1) {
            message.channel.send("Le nombre de dés et de faces doit être supérieur à 0.");
            return;
        }

        const { rolls, total } = rollDice(count, sides);
        message.channel.send(`🎲 Tu as lancé ${diceInput} et obtenu : [${rolls.join(', ')}] avec un total de **${total}**`); 
    }
});

// Listen Button
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.reply({ content: `Tu as cliqué sur le bouton ${interaction.customId}`, ephemeral: true });

    try {
        await interaction.message.delete();
    } catch (error) {
        console.error('Erreur lors de la suppression du message :', error);
    }
});

// Launch
client.login(process.env.DISCORD_TOKEN);