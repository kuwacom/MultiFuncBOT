import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as Error from "../format/error";
import * as Panel from "../format/panel";
import Discord from "discord.js";

export const selectMenu = {
    customId: ["pollVote"]
}

export const executeInteraction = async (interaction: Types.DiscordSelectMenuInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const pollId = Number(values[0]);
    
    const pollData = pollManager.getPollData(Number([values]));
    if (!pollData) {
        interaction.reply(Error.interaction.NotfoundPoll);
        return; 
    }

    const answer = Number(interaction.values[0]);
    const userId = interaction.user.id;

    if (!(userId in pollData.voters)) pollData.voters[userId] = {
        id: userId,
        answer: []
    }

    let embed;

    let index = pollData.voters[userId].answer.indexOf(answer);
    if (index == -1) {
        pollData.voters[userId].answer.push(answer);
        embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.success)
            .setTitle(config.emoji.check + '投票しました！')
            .setDescription('**' + pollData.contents[answer] + '** へ投票しました！')
            .setFooter({ text: config.embed.footerText })
    } else {
        pollData.voters[userId].answer.splice(index, 1);
        embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.warning)
            .setTitle(config.emoji.check + '投票を解除しました...')
            .setDescription('**' + pollData.contents[answer] + '** への投票を解除しました')
            .setFooter({ text: config.embed.footerText })
    }

    await interaction.update({
        embeds: [
            Panel.PollPanelEmbed(pollData)
        ],
    });

    interaction.followUp({
        embeds: [ embed ],
        ephemeral: true
    });
    return;
}