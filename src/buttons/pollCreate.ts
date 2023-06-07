import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const button = {
    customId: ["pollCreate"]
}

export const executeInteraction = async (interaction: Types.DiscordButtonInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");

    
    return;
}