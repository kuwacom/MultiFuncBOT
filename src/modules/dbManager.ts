import Discord from "discord.js";
import * as DiscordVoice from "@discordjs/voice";
import * as Types from "./types";
import fs from "fs";
import path from "path";
import { config, logger } from "../bot";

export const serverDBs: { [serverId: string]: Types.ServerDB} = {};

export const initialize = async(): Promise<void> => {
    fs.readdir(config.path.serverDB, (error, files) => {
        if (error) logger.error("dbManager-serverDB" + error);
        files.filter((file) => {
            return path.extname(file).toLowerCase() == '.json';
        }).forEach(async (dir: any) => {
            logger.info("load serverdb: " + dir);
            
            try {
                const serverId = path.basename(dir, ".json");
                serverDBs[serverId] = JSON.parse(fs.readFileSync(config.path.serverDB +"/"+ dir).toString());
            } catch (error) {
                logger.error("ERROR DB:" + dir + "\n" + error);
            }
        });
    });
}

export const getServerDB = (guildId: string): Types.ServerDB => {
    if (!serverDBs[guildId]) serverDBs[guildId] = {
        id: guildId,
        pollDatas: {}
    };
    return serverDBs[guildId];
    // const serverDB = serverDBs[guildId];
    // return {
    //     id: serverDB.id,
    //     pollDatas: serverDB.pollDatas
    // };
    // platform: serverDB?.search?.platform != undefined ? serverDB.search.platform : "youtube",
}

export const saveServerDB = async(guildId: string): Promise<void> => {
    fs.writeFile(config.path.serverDB+ "/" + guildId + ".json", JSON.stringify(serverDBs[guildId]), async (error) => {
        if (error) logger.error("[dbManager.saveServerDB] :" + error);
        logger.debug("DONE Save ServerDB " + guildId);
    });
}