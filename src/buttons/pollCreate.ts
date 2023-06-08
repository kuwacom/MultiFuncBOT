import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as FormatERROR from "../format/error";
import Discord from "discord.js";

export const button = {
    customId: ["pollCreate"]
}

export const executeInteraction = async (interaction: Types.DiscordButtonInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const pollId = Number(values[0]);
    
    const pollData = pollManager.getPollData(Number([values]));
    if (!pollData) {
        interaction.reply(FormatERROR.interaction.NotfoundPoll);
        return;
    }

    if (!pollData.editable) {
        interaction.reply(FormatERROR.interaction.Created);
        return;
    }

    const pollState = pollManager.pollEditableChange(pollId, false);

    const fields: Discord.EmbedField[] = [
        // {
        //     name: 'タイトル',
        //     value: title,
        //     inline: false
        // }
    ];

    const embed = new Discord.EmbedBuilder()
	.setColor(Types.embedCollar.info)
	.setTitle(config.emoji.check + pollData.title)
    .addFields(fields)
    .setFooter({ iconURL: interaction.user.avatarURL() as string, text: `${interaction.user.username}#${interaction.user.discriminator}\n` +
        config.embed.footerText 
    });

    if (pollData.description) embed.setDescription(pollData.description);

    const createButton = new Discord.ButtonBuilder()
        .setCustomId('pollCreate:'+pollData.id)
        .setLabel('作成')
        // .setEmoji(config.emoji)
        .setStyle(Discord.ButtonStyle.Success);
        // .setDisabled(false)

    const editButton = new Discord.ButtonBuilder()
        .setCustomId('pollEdit:'+pollData.id)
        .setLabel('編集')
        // .setEmoji(config.emoji)
        .setStyle(Discord.ButtonStyle.Primary);
        // .setDisabled(false)


    const buttons = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(createButton)
        .addComponents(editButton);

    interaction.reply({
        embeds: [ embed ],
        components: [ buttons ],
        ephemeral: true
    });
    return;
}