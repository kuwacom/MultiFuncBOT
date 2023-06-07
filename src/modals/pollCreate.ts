import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as pollManager from "../modules/pollManager";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const modal = {
    customId: ["pollCreate"]
}

export const executeInteraction = async (interaction: Types.DiscordModalSubmitInteraction) => {
    const title = interaction.fields.getTextInputValue('title');
    const description = interaction.fields.getTextInputValue('description');
    const contents = interaction.fields.getTextInputValue('contents').split(':').filter(content => content.replace(" ", "").replace("　", "") != '');

    let pollData;
    for (let c = 0; c++; c < 10) {
        pollData = pollManager.createPoll(title, description, contents);
        if (pollData != Types.PollState.DuplicateID) continue;
    }
    

    return;
}