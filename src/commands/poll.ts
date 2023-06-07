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
    // type: 1,
    // options: [
    //     {
    //         name: "switch",
    //         description: "複数投票を許可するか",
    //         required: true,
    //         type: 5
    //     },
    //     {
    //         name: "title",
    //         description: "アンケートのタイトル",
    //         required: true,
    //         type: 3
    //     },
    //     {
    //         name: "description",
    //         description: "アンケートの詳細",
    //         required: false,
    //         type: 3
    //     }
    // ]
}


export const executeMessage = async (message: Discord.Message) => {
    if (!message.guild || !message.member || message.channel.type == Discord.ChannelType.GuildStageVoice) return;  // v14からステージチャンネルからだとsendできない
    // messageCommand
}

export const executeInteraction = async (interaction: Types.DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand

    // const switchBoolean = interaction.options.getBoolean("swich");
    // const title = interaction.options.getString("title");
    // const description = interaction.options.getString("description", false);

    // interaction.reply({
    //     embeds: [
    //         new Discord.EmbedBuilder()
    //         .setColor(Types.embedCollar.success)
    //         .setTitle(title)
    //         .setDescription(description)
    //         .setFooter({ iconURL: interaction.user.avatarURL() as string, text: `${interaction.user.username}#${interaction.user.discriminator}\n` +
    //             config.embed.footerText
    //         })
    //     ],
    //     allowedMentions: {
    //         repliedUser: false
    //     },
    //     ephemeral: true
    // });


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
                .setLabel('アンケート項目 ( : で項目を区切ってください)')
                .setPlaceholder("項目1:項目2:項目3:項目4")
                .setStyle(Discord.TextInputStyle.Paragraph)
        )
    );

    await interaction.showModal(modal);
}
