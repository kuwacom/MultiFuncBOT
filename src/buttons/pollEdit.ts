import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import { getPollData } from "../modules/pollManager";
import * as Types from "../modules/types";
import * as FormatERROR from "../format/error";
import Discord from "discord.js";

export const button = {
    customId: ["pollEdit"]
}

export const executeInteraction = async (interaction: Types.DiscordButtonInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");

    const pollData = getPollData(Number([values]));
    if (!pollData) {
        interaction.reply(FormatERROR.interaction.NotfoundPoll);
        return;
    }

    const modal = new Discord.ModalBuilder()
        .setCustomId('pollCreate')
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
                .setLabel('アンケート項目 ( : で項目を区切ってください)')
                .setPlaceholder("項目1:項目2:項目3:項目4")
                .setValue(pollData.contents.join(':'))
                .setStyle(Discord.TextInputStyle.Paragraph)
        )
    );

    await interaction.showModal(modal);
    return;
}