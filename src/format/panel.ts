import { logger, config, client } from "../bot";
import * as Types from "../modules/types";
import Discord from "discord.js";
import { progressBar } from "../modules/utiles";

export const PollPanelEmbed = (pollData: Types.PollData): Discord.EmbedBuilder => {
    const voteCount: number[] = [];
    let outText = "";
    let graphText = "";
    Object.keys(pollData.voters).forEach(key => { // voteCount にそれぞれの票の数入れてく
        pollData.voters[key].answer.forEach(contentNum => {
            if (!(contentNum in voteCount)) voteCount[contentNum] = 0;
            voteCount[contentNum]++;
        });
    });
    pollData.contents.forEach((content, index) => {
        outText += `${String(index).padStart(2, '0')}. ${content}: ${voteCount[index] ? voteCount[index] : 0}\n`
    });

    // graph表示機構
    const voteTotal = voteCount.reduce((sum, element) => sum + element, 0);
    pollData.contents.forEach((content, index) => {
        let percent = ((voteCount[index] / voteTotal) ? (voteCount[index] / voteTotal) : 0 )*100;
        percent = percent ? percent : 0;
        graphText += `${String(index).padStart(2, '0')}. ${String(Math.round(percent)).padStart(2, '0')}%: ${progressBar(Math.round(percent), 101)}\n`
    });

    const fields: Discord.EmbedField[] = [
        {
            name: "投票数",
            value: "```\n" +
            outText +
            "```",
            inline: false
        },
        {
            name: "投票グラフ",
            value: "```\n" +
            graphText +
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