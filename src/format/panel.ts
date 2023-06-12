import { logger, config, client } from "../bot";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const PollPanelEmbed = (pollData: Types.PollData): Discord.EmbedBuilder => {
    const voteCount: { [contentNum: number]: number} = {};
    let outText = "";
    Object.keys(pollData.voters).forEach(key => { // voteCount にそれぞれの票の数入れてく
        pollData.voters[key].answer.forEach(contentNum => {
            if (!(contentNum in voteCount)) voteCount[contentNum] = 0;
            voteCount[contentNum]++;
        });
    });
    pollData.contents.forEach((content, index) => {
        outText += `${content}: ${voteCount[index] ? voteCount[index] : 0}\n`
    });

    const fields: Discord.EmbedField[] = [
        {
            name: "投票数",
            value: "```\n" +
            outText +
            "```",
            inline: false
        }
    ];
    const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.success)
        .setTitle(config.emoji.help + pollData.title)
        .setDescription("poll ID: `" + pollData.id + "`")
        .addFields(fields)
        .setFooter({  text: config.embed.footerText });
    if (pollData.description) embed.setDescription(
        pollData.description + "\n\n" +
        EmbedPollId(pollData)
        );
    return embed;
}

export const EmbedPollId = (pollData: Types.PollData): string => {
    return "poll ID: `" + pollData.id + "`";
}