import * as Types from "./types";
import * as dbManager from "./dbManager";
import { randRange } from "./utiles";
import { config } from "../bot";

export const link = (guildId: string, channelId: string, userId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (serverDB.TC2DM.find( TC2DM => TC2DM.channelId == channelId && TC2DM.userId == userId)) return false;
    serverDB.TC2DM.push({
        channelId: channelId,
        userId: userId
    });
    dbManager.saveServerDB(guildId);
    return true;
}

export const unLink = (guildId: string, channelId: string, userId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    const TC2DMIndex = serverDB.TC2DM.findIndex( TC2DM => TC2DM.channelId == channelId && TC2DM.userId == userId);
    if (TC2DMIndex == -1) return false;
    serverDB.TC2DM.splice(TC2DMIndex, 1);
    dbManager.saveServerDB(guildId);
    return true;
}