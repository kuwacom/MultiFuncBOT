import { logger, config, client } from "../bot";
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
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply(Error.interaction.ERROR)
        return;
    }
    
    const pollData = pollManager.getPollData(guildId, pollId);
    if (!pollData) {
        interaction.reply(Error.interaction.NotfoundPoll);
        return; 
    }

    if (interaction.values[0] == 'otherAnswer') { // 個別回答
        const modal = new Discord.ModalBuilder()
            .setCustomId("otherAnswer:" + pollId) 
            .setTitle('ポールの作成');

        modal.addComponents(
            new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('value')
                    .setLabel('回答内容')
                    .setPlaceholder("その他の回答内容をお答えください。")
                    .setStyle(Discord.TextInputStyle.Paragraph)
            )
        );

        await interaction.showModal(modal);
        return;
    }
    
    const answer = Number(interaction.values[0]);
    const userId = interaction.user.id;

    let embed; 
    if (!pollData.multiple && pollManager.checkVoterALL(guildId, pollId, userId)) {
        if (pollManager.isSameVoterContent(guildId, pollId, userId, answer)) {
            console.log(pollManager.toggleVote(guildId, pollId, userId, answer))
            embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.check + '投票を解除しました...')
                .setDescription('**' + pollData.contents[answer] + '** への投票を解除しました')
                .setFooter({ text: config.embed.footerText })    
        } else {
            embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.warning + 'すでに投票しています！')
                .setDescription(
                    'すでに投票をしているため、投票できません！\n'+
                    '現在投票している票を取り消してから行ってください'
                )
                .setFooter({ text: config.embed.footerText })
        }
    } else {
        const result = pollManager.toggleVote(guildId, pollId, userId, answer);
        if (result) {
            embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.success)
                .setTitle(config.emoji.check + '投票しました！')
                .setDescription('**' + pollData.contents[answer] + '** へ投票しました！')
                .setFooter({ text: config.embed.footerText })
        } else {
            embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.check + '投票を解除しました...')
                .setDescription('**' + pollData.contents[answer] + '** への投票を解除しました')
                .setFooter({ text: config.embed.footerText })
        }
    }
    // let index = pollData.voters[userId].answer.indexOf(answer);
    // if (index == -1) {
    //     pollData.voters[userId].answer.push(answer);
    //     embed = new Discord.EmbedBuilder()
    //         .setColor(Types.embedCollar.success)
    //         .setTitle(config.emoji.check + '投票しました！')
    //         .setDescription('**' + pollData.contents[answer] + '** へ投票しました！')
    //         .setFooter({ text: config.embed.footerText })
    // } else {
    //     pollData.voters[userId].answer.splice(index, 1);
    //     embed = new Discord.EmbedBuilder()
    //         .setColor(Types.embedCollar.warning)
    //         .setTitle(config.emoji.check + '投票を解除しました...')
    //         .setDescription('**' + pollData.contents[answer] + '** への投票を解除しました')
    //         .setFooter({ text: config.embed.footerText })
    // }

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