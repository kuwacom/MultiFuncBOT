import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as Types from "../modules/types";
import Discord from "discord.js";
import { interaction } from "../format/error";

export const command = {
    name: "poll",
    description: "アンケートコマンド",
    options: [
        {
            name: "create",
            description: "アンケートを作成します",
            type: 1
        }
    ]
}


export const executeMessage = async (message: Discord.Message) => {
    if (!message.guild || !message.member || message.channel.type == Discord.ChannelType.GuildStageVoice) return;  // v14からステージチャンネルからだとsendできない
    // messageCommand
}

export const executeInteraction = async (interaction: Types.DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand
    
    const modal = new Discord.ModalBuilder()
        .setCustomId('pollCreate')
        .setTitle('ポールの作成');

    modal.addComponents(
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('title')
                .setLabel('ポールのタイトル')
                .setPlaceholder("ポールのタイトルを入力してください")
                .setStyle(Discord.TextInputStyle.Short)
                .setMaxLength(config.poll.titleMax)
                .setMinLength(config.poll.titleMin)
        ),
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('description')
                .setLabel('ポールの詳細')
                .setPlaceholder("ポールの詳細を入力してください")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setMaxLength(config.poll.descriptionMax)
                .setMinLength(config.poll.descriptionMin)
                .setRequired(false)
        ),
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('contents')
                .setLabel('アンケート項目 (項目は行ごとです)  最大25項目まで追加できます')
                .setPlaceholder('項目1\n項目2\n項目3\n項目4')
                .setStyle(Discord.TextInputStyle.Paragraph)
        )
    );

    await interaction.showModal(modal);
}
