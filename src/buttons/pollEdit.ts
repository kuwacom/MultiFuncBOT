import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as Error from "../format/error";
import Discord from "discord.js";

export const button = {
    customId: ["pollEdit"]
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


    const modal = new Discord.ModalBuilder()
        .setCustomId('pollEdit:'+pollData.id)
        .setTitle('ポールの編集');

    modal.addComponents(
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('title')
                .setLabel('ポールのタイトル')
                .setPlaceholder("ポールのタイトルを入力してください")
                .setValue(pollData.title)
                .setStyle(Discord.TextInputStyle.Short)
                .setMaxLength(config.poll.titleMax)
                .setMinLength(config.poll.titleMin)
        ),
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('description')
                .setLabel('ポールの詳細')
                .setPlaceholder("ポールの詳細を入力してください")
                .setValue(pollData.description ? pollData.description : '')
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setMaxLength(config.poll.descriptionMax)
                .setMinLength(config.poll.descriptionMin)
                .setRequired(false)
        ),
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('contents')
                .setLabel('アンケート項目 (項目は行ごとです)')
                .setPlaceholder('項目1\n項目2\n項目3\n項目4')
                .setValue(pollData.contents.join('\n'))
                .setStyle(Discord.TextInputStyle.Paragraph)
        )
    );

    await interaction.showModal(modal);
    return;
}