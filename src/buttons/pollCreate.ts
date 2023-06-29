import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as Error from "../format/error";
import * as Panel from "../format/panel";
import Discord from "discord.js";

export const button = {
    customId: ["pollCreate"]
}

export const executeInteraction = async (interaction: Types.DiscordButtonInteraction) => {
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

    if (!pollData.editable) {
        interaction.reply(Error.interaction.Created);
        return;
    }

    pollManager.pollEditableChange(guildId, pollId, false);

    interaction.update({
        embeds: [
            new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.info)
                .setTitle(config.emoji.check + "ポールを作成しました！")
                .setDescription(
                    "投票をしてください！\n\n"+
                    Panel.EmbedPollId(pollData)
                    )
                .setFooter({ text: config.embed.footerText })
        ],
        components: []
    });

    const selectMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId('pollVote:' + pollId)
        .setPlaceholder('投票してください');

    // 複数選択機能つける場合はここで set min と set max

    pollData.contents.forEach((content, index) => {
        selectMenu.addOptions(
            new Discord.StringSelectMenuOptionBuilder()
            .setLabel(content)
            .setValue(String(index))
        );
    });

    if (pollData.otherAnswerChannelId) {
        selectMenu.addOptions(
            new Discord.StringSelectMenuOptionBuilder()
            .setLabel('その他の回答')
            .setValue('otherAnswer')
        );
    }

    const selectVote = new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>()
        .addComponents(selectMenu);

    const pollMessage = await interaction.channel?.send({
        embeds: [
            Panel.PollPanelEmbed(pollData)
        ],
        components: [ selectVote ]
    });
    if (!pollMessage?.id) return;
    pollManager.setPollMessage(guildId, pollId, pollMessage.id, pollMessage.channel.id);
    return;
}