import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as Types from "../modules/types";
import * as TC2DMManager from "../modules/tc2dmManager";
import Discord from "discord.js";

export const command = {
    name: "tc2dm",
    description: "テキストチャンネルとダイレクトメッセージを接続します", 
    options: [
        {
            name: "link",
            description: "実行もしくは指定したチャンネルと指定した人のDMを接続します",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "接続したいユーザーを選択してください",
                    required: true,
                    type: 6
                },
                {
                    name: "channel",
                    description: "接続したいチャンネルを選択してください",
                    required: false,
                    type: 7,
                    channel_types: [0,2]
                }
            ]
        },
        {
            name: "unlink",
            description: "指定したユーザーとの接続を切断します",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "切断したいユーザーを選択してください",
                    required: true,
                    type: 6
                },
                {
                    name: "channel",
                    description: "接続したいチャンネルを選択してください",
                    required: false,
                    type: 7,
                    channel_types: [0,2]
                }
            ]
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

    const subCommand = interaction.options.getSubcommand();

    if (subCommand == "link") {
        const targetUserId = interaction.options.getUser("user")?.id;
        if (!targetUserId) return;
        let targetChannelId = interaction.options.getChannel("channel")?.id;
        if (!targetChannelId) targetChannelId = interaction.channel.id;
    
        const linkRe = TC2DMManager.link(interaction.guild.id, targetChannelId, targetUserId);
        let embed;
        
        if (linkRe) {
            embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.success)
            .setTitle(config.emoji.check + "DMとリンクしました！")
            .setDescription(
                "TCとDMをリンクしました！\n\n" +
                `<@${targetUserId}> < - > <#${targetChannelId}>`
            )
            .setFooter({ text: config.embed.footerText });
        } else {
            embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.error + "すでにリンクしています！")
            .setDescription(
                "このTCとDMはすでにリンクされています"
            )
            .setFooter({ text: config.embed.footerText });
        }
    
        interaction.reply({ embeds: [ embed ] });
        return;
    
    } else if (subCommand == "unlink") {
        const targetUserId = interaction.options.getUser("user")?.id;
        if (!targetUserId) return;
        let targetChannelId = interaction.options.getChannel("channel")?.id;
        if (!targetChannelId) targetChannelId = interaction.channel.id;
    
        const linkRe = TC2DMManager.unLink(interaction.guild.id, targetChannelId, targetUserId);
        let embed;
        
        if (linkRe) {
            embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.warning)
            .setTitle(config.emoji.check + "DMとのリンクを解除しました")
            .setDescription(
                "解除したリンク\n\n" +
                `<@${targetUserId}> < - > <#${targetChannelId}>`
            )
            .setFooter({ text: config.embed.footerText });
        } else {
            embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.error + "存在しないリンクです！")
            .setDescription(
                "このTCとDMはリンクされていません"
            )
            .setFooter({ text: config.embed.footerText });
        }
        interaction.reply({ embeds: [ embed ] });

        return;
        
    }

}
