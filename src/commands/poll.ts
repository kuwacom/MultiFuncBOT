import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as Error from "../format/error";
import * as Panel from "../format/panel";
import * as dbManager from "../modules/dbManager";
import Discord from "discord.js";

export const command = {
    name: "poll",
    description: "アンケートコマンド",
    options: [
        {
            name: "create",
            description: "アンケートを作成します",
            type: 1,
            options: [
                {
                    name: "multiple",
                    description: "複数回答を許可するか",
                    required: true,
                    type: 5
                },
                {
                    name: "channel",
                    description: "その他 の項目を追加して指定チャンネルに送信する",
                    required: false,
                    type: 7,
                    channel_types: [0,2]
                }
            ]
        },
        {
            name: "delete",
            description: " アンケートを削除します",
            type: 1,
            options: [
                {
                    name: "pollid",
                    description: "削除するpollのID",
                    required: true,
                    type: 4,
                }
            ]
        },
        {
            name: "list",
            description: "現在開催中のアンケートリストを表示します",
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
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply(Error.interaction.ERROR)
        return;
    }

    const subCommand = interaction.options.getSubcommand();

    if (subCommand == "create") {
        const otherAnswerChannel = interaction.options.getChannel("channel");
        const multiple = interaction.options.getBoolean("multiple");

        const modal = new Discord.ModalBuilder()
            .setCustomId("pollCreate:" + (otherAnswerChannel?.id ? otherAnswerChannel?.id : "") + ":" + multiple) // pollCreate:channelId:multiple
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
    } else if (subCommand == "delete") {
        const pollId = interaction.options.getInteger("pollid");
        if (!pollId) return;
        const pollData = pollManager.deletePoll(guildId, pollId);
        if (!pollData) {
            interaction.reply(Error.interaction.NotfoundPoll);
            return;
        }
        
        const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.error)
        .setTitle(config.emoji.check + 'ポールを削除しました！')
        .setDescription(
            'ポール回答を読み取りのみにしました！'
        )
        .setFooter({ text: config.embed.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: true
        });

        if (!pollData.pollMessage) return;
        const pollMessageChannel = await client.channels.fetch(pollData.pollMessage.channelId);
        if (pollMessageChannel?.type != Discord.ChannelType.GuildText) return;
        const pollMessage = await pollMessageChannel?.messages.fetch(pollData.pollMessage.id);
        pollMessage.edit({
            embeds: [Panel.PollENDPanelEmbed(pollData)],
            components: []
        });
        
    } else if (subCommand == "list") {
        const serverDB = dbManager.getServerDB(guildId);
        const fields = Object.keys(serverDB.pollDatas).map((key: any) => {
            if (serverDB.pollDatas[key].editable) return;
            return {
                name: serverDB.pollDatas[key].title,
                value: 
                    "pollId: `" + key + "`\n" +
                    (serverDB.pollDatas[key].description ? "詳細: `" + serverDB.pollDatas[key].description + "`" : ""),
                    inline: true
            }
        }).filter(e => e);
        if (fields.length == 0) {
            interaction.reply(Error.interaction.NotfoundPoll);
            return; 
        } else {
            const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.success)
                .setTitle(config.emoji.help + '現在存在するポール')
                .setFields(fields as [])
                .setFooter({ text: config.embed.footerText })
            interaction.reply({
                embeds: [ embed ]
            });
        }
    }

}
