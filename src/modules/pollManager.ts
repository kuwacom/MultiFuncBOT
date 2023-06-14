import Discord from "discord.js";
import * as Types from "./types";
import * as dbManager from "./dbManager";
import { randRange } from "./utiles";
import { config } from "../bot";


export const getPollData = (guildId: string, pollId: number): Types.PollData | null => {
    const pollDatas = dbManager.getServerDB(guildId).pollDatas;
    if (!pollDatas) dbManager.getServerDB(guildId).pollDatas = {};
    if (!(pollId in pollDatas)) return null;
    return pollDatas[pollId];
}

const maxPollCheck = (pollDatas: {[pollId: number]: Types.PollData}): void => {
    if (Object.keys(pollDatas).length == config.poll.maxPoll) {
        const timeList: number[] = [];
        Object.keys(pollDatas).forEach((key: any) => { // ポールの作成時間をarrayに
            timeList.push(pollDatas[key].time);
        });
        Object.keys(pollDatas).forEach((key: any) => { // 作成時間が一番古いのを消す
            if (pollDatas[key].time == Math.min(...timeList)) delete pollDatas[key]; 
        }); 
    }; 
}

export const createPoll = (guildId: string, title: string, description: string | null, contents: string[]): Types.PollData | Types.PollState.DuplicateID => {
    const pollDatas = dbManager.getServerDB(guildId).pollDatas;
    const pollId = randRange(1000000, 9999999);
    if (pollDatas) {
        if (pollId in pollDatas) return Types.PollState.DuplicateID;
        maxPollCheck(pollDatas);
    } else {
        dbManager.getServerDB(guildId).pollDatas = {};
    }

    if (description == '') description = null;

    const pollData = {
        id: pollId,
        title: title,
        description: description,
        time: new Date().getTime(),
        editable: true,
        voters: {},
        contents: contents
    };
    pollDatas[pollId] = pollData;
    dbManager.saveServerDB(guildId);
    return pollData;
}

// export const addContent = (pollId: number, content: string):Types.PollState | boolean => { // poll作成時内容ついか
//     if (!pollDatas || !(pollId in pollDatas)) return Types.PollState.NotFund;
//     pollDatas[pollId].contents.push(content);
//     return true;
// }

export const pollEditableChange = (guildId: string, pollId: number, editable: boolean):Types.PollData | Types.PollState.NotFund => { // poll作成時に内容を変える用
    const pollData = getPollData(guildId, pollId);
    if (!pollData) return Types.PollState.NotFund;
    pollData.editable = editable;
    dbManager.saveServerDB(guildId);
    return pollData;
}


export const updateContents = (guildId: string, pollId: number, contents: string[]):Types.PollData | null => { // poll作成時に内容を変える用
    const pollData = getPollData(guildId, pollId);
    if (!pollData) return null;
    pollData.contents = contents;
    dbManager.saveServerDB(guildId);
    return pollData;
}

// export const checkVoterALL = (guildId: string, pollId: number, userId: string):Types.PollState | boolean => { // 1つでも票がが存在するかどうか
//     const pollDatas = dbManager.getServerDB(guildId).pollDatas;
//     if (!pollDatas || !(pollId in pollDatas)) return Types.PollState.NotFund;
//     if (userId in pollDatas[pollId].voters) return true;
//     return false;
// }

// export const checkVoterContent = (guildId: string, pollId: number, userId: string):Types.PollState | boolean => { // 同じ票が存在するかどうか
//     const pollDatas = dbManager.getServerDB(guildId).pollDatas;
//     if (!pollDatas || !(pollId in pollDatas)) return Types.PollState.NotFund;
//     if (userId in pollDatas[pollId].voters) return true;
//     return false;
// }

export const toggleVote = (guildId: string, pollId: number, userId: string, answer: number): Types.PollState | number => {
    const pollData = getPollData(guildId, pollId);
    if (!pollData) return Types.PollState.NotFund;
    const index = pollData.voters[userId].answer.indexOf(answer);
    if (index == -1) {
        addVote(guildId, pollId, userId, answer);
    } else {
        removeVote(guildId, pollId, userId, answer);
    }
    return index;
}

export const addVote = (guildId: string, pollId: number, userId: string, answer: number):Types.PollState | boolean => { // 票の追加
    const pollData = getPollData(guildId, pollId);
    if (!pollData) return Types.PollState.NotFund;
    if (!pollData.voters[userId]) pollData.voters[userId] = {
        id: userId,
        answer: []
    };
    pollData.voters[userId].answer.push(answer);
    dbManager.saveServerDB(guildId);
    return true;
}

export const removeVote = (guildId: string, pollId: number, userId: string, answer: number):Types.PollState | boolean => { // 票の追加
    const pollData = getPollData(guildId, pollId);
    if (!pollData) return Types.PollState.NotFund;
    let index = pollData.voters[userId].answer.indexOf(answer);

    if (index == -1) false;
    pollData.voters[userId].answer.splice(index, 1);
    dbManager.saveServerDB(guildId);
    return true;
}