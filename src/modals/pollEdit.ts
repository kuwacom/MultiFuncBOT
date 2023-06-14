import { logger, config, client } from "../bot";
import { autoDeleteMessage, buttons, sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import * as Error from "../format/error";
import * as Panel from "../format/panel"
import Discord from "discord.js";

export const modal = {
    customId: ["pollEdit"]
}

export const executeInteraction = async (interaction: Types.DiscordModalSubmitInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const pollId = Number(values[0]);
    
    const title = interaction.fields.getTextInputValue('title');
    const description = interaction.fields.getTextInputValue('description');
    const contents = interaction.fields.getTextInputValue('contents').split('\n').filter(content => content.replace(" ", "").replace("　", "") != '').slice(0, 24);
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply(Error.interaction.ERROR)
        return;
    }

    let pollData = pollManager.updateContents(guildId, pollId, contents);
    if (!pollData) {
        interaction.reply(Error.interaction.NotfoundPoll);
        return; 
    }

    const fields: Discord.EmbedField[] = [
        {
            name: 'タイトル',
            value: title,
            inline: false
        }
    ]

    if (description) {
        fields.push(
            {
                name: '詳細',
                value: description,
                inline: false
            }
        );
    }
    
    fields.push(
        {
            name: 'アンケート項目',
            value: '```\n'+
            contents.join('\n')
            +'\n```',
            inline: false
        }
    );

    const embed = new Discord.EmbedBuilder()
	.setColor(Types.embedCollar.info)
	.setTitle(config.emoji.check + 'ポールの作成')
	.setDescription(
        'ポールの内容を確認してください\n' +
        '内容が正しければ **作成** ボタンを押してください\n' +
        '編集したい場合は **編集** ボタンを押してください\n\n'+
        Panel.EmbedPollId(pollData)
        )
    .addFields(fields)
    // .setFooter({ iconURL: interaction.user.avatarURL() as string, text: `${interaction.user.username}#${interaction.user.discriminator}\n` +
    //     config.embed.footerText 
    // })
    .setFooter({ text: config.embed.footerText })

    const createButton = new Discord.ButtonBuilder()
        .setCustomId('pollCreate:'+pollData.id)
        .setLabel('作成')
        // .setEmoji(config.emoji)
        .setStyle(Discord.ButtonStyle.Success);
        // .setDisabled(false)

    const editButton = new Discord.ButtonBuilder()
        .setCustomId('pollEdit:'+pollData.id)
        .setLabel('編集')
        // .setEmoji(config.emoji)
        .setStyle(Discord.ButtonStyle.Primary);
        // .setDisabled(false)


    const buttons = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(createButton)
        .addComponents(editButton);
    
    interaction.reply({
        embeds: [ embed ],
        components: [ buttons ],
        ephemeral: true
    });

    return;
}