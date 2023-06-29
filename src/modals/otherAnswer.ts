import { logger, config, client } from "../bot";
import { autoDeleteMessage, buttons, sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as Error from "../format/error";
import * as Panel from "../format/panel"
import Discord from "discord.js";

export const modal = {
    customId: ["otherAnswer"]
}

export const executeInteraction = async (interaction: Types.DiscordModalSubmitInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const pollId = Number(values[0]);
    
    const value = interaction.fields.getTextInputValue('value');
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply(Error.interaction.ERROR)
        return;
    }

    let pollData = pollManager.getPollData(guildId, pollId);
    if (!pollData || typeof(pollData.otherAnswerChannelId) != "string") {
        interaction.reply(Error.interaction.NotfoundPoll);
        return; 
    }

    const otherAnswerChannel = await client.channels.fetch(pollData.otherAnswerChannelId);
    if(otherAnswerChannel?.type == Discord.ChannelType.GuildText) {        
        const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.success)
            .setTitle(config.emoji.check + '回答を受信しました！')
            .setDescription(
                "pollId: " + pollId + "\n" +
                "**" + pollData.title + "** より回答を受信しました！\n\n" +
                value
                )
            .setFooter({ text: config.embed.footerText })
            .setTimestamp(pollData.time)
        otherAnswerChannel.send({embeds: [ embed ]});
    } 

    const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.info)
        .setTitle(config.emoji.check + '送信完了')
        .setDescription('別回答を送信しました！')
        .setFooter({ text: config.embed.footerText })

    interaction.reply({
        embeds: [ embed ],
        ephemeral: true
    });

    return;
}