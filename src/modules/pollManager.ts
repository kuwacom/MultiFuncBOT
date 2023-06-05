import Discord from "discord.js";
import * as Types from "./types"
import { randRange } from "./utiles";
import { content } from "googleapis/build/src/apis/content";

export const pollDatas: { [pollId: number]: Types.PollData} = {};

export const getPollData = (pollId: number): Types.PollData | null => {
    if (!(pollId in pollDatas)) return null;
    return pollDatas[pollId];
}

export const createPoll = (title: string, description: string | null): Types.PollData | null => {
    const id = randRange(1000000, 9999999);
    if (!(id in pollDatas)) return null;
    if (description == '') description = null;
    const pollData = {
        id: id,
        title: title,
        description: description,
        time: new Date().getTime(),
        voters: [],
        contents: []
    }; 
    pollDatas[id] = pollData;
    return pollData;
}

export const addContent = (pollId: number, content: string):boolean => {
    if (!(pollId in pollDatas)) return false;
    pollDatas[pollId].contents.push(content);
    return true;
}

export const updateContents = (pollId: number, contents: string[]):boolean => {
    if (!(pollId in pollDatas)) return false;
    pollDatas[pollId].contents = contents;
    return true;
}


export const addVoter = (pollId: number, userId: string, answer: number):boolean => {
    if (!(pollId in pollDatas)) return false;
}