import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as Types from "../modules/types";
import Discord from "discord.js";
import { interaction } from "../format/error";

export const command = {
    name: "poll",
    description: "アンケートを開始します",
    type: 1,
    options: [
        {
            name: "switch",
            description: "複数投票を許可するか",
            required: true,
            type: 5
        },
        {
            name: "title",
            description: "アンケートのタイトル",
            required: true,
            type: 3
        },
        {
            name: "description",
            description: "アンケートの詳細",
            required: false,
            type: 3
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

    const switchBoolean = interaction.options.getBoolean("swich");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description", false);

    interaction.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.success)
            .setTitle(title)
            .setDescription(description)
            .setFooter({ iconURL: interaction.user.avatarURL() as string, text: `${interaction.user.username}#${interaction.user.discriminator}\n` +
                config.embed.footerText
            })
        ],
        allowedMentions: {
            repliedUser: false
        },
        ephemeral: true
    });
}
