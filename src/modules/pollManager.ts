import Discord from "discord.js";
import * as Types from "./types"
import { randRange } from "./utiles";
import { config } from "../bot";

export const pollDatas: { [pollId: number]: Types.PollData} = {};

export const getPollData = (pollId: number): Types.PollData | null => {
    if (!(pollId in pollDatas)) return null;
    return pollDatas[pollId];
}

const maxPollCheck = (): void => {
    if (Object.keys(pollDatas).length == config.maxPoll) {
        const timeList: number[] = [];
        Object.keys(pollDatas).forEach((key: any) => {
            timeList.push(pollDatas[key].time);
        });
        Object.keys(pollDatas).forEach((key: any) => {
            if (pollDatas[key].time == Math.min(...timeList)) delete pollDatas[key]; 
        }); 
    }; 
}

export const createPoll = (title: string, description: string | null): Types.PollData | null => {
    const id = randRange(1000000, 9999999);
    if (!(id in pollDatas)) return null;
    if (description == '') description = null;

    maxPollCheck();

    const pollData = {
        id: id,
        title: title,
        description: description,
        time: new Date().getTime(),
        voters: {},
        contents: []
    }; 
    pollDatas[id] = pollData;
    return pollData;
}

// export const addContent = (pollId: number, content: string):Types.PollState | boolean => { // poll作成時内容ついか
//     if (!(pollId in pollDatas)) return Types.PollState.NotFund;
//     pollDatas[pollId].contents.push(content);
//     return true;
// }

export const updateContents = (pollId: number, contents: string[]):Types.PollState | boolean => { // poll作成時に内容を変える用
    if (!(pollId in pollDatas)) return Types.PollState.NotFund;
    pollDatas[pollId].contents = contents;
    return true;
}

export const checkVoterALL = (pollId: number, userId: string):Types.PollState | boolean => { // 1つでも票がが存在するかどうか
    if (!(pollId in pollDatas)) return Types.PollState.NotFund;
    if (userId in pollDatas[pollId].voters) return true;
    return false;
}

export const checkVoterContent = (pollId: number, userId: string):Types.PollState | boolean => { // 同じ票が存在するかどうか
    if (!(pollId in pollDatas)) return Types.PollState.NotFund;
    if (userId in pollDatas[pollId].voters) return true;
    return false;
}

export const addVote = (pollId: number, userId: string, answer: number):Types.PollState | boolean => { // 票の追加
    if (!(pollId in pollDatas)) return Types.PollState.NotFund;
    if (!pollDatas[pollId].voters[userId]) pollDatas[pollId].voters[userId] = {
        id: userId,
        answer: []
    };
    pollDatas[pollId].voters[userId].answer.push(answer);
    return true;
}

export const removeVote = (pollId: number, userId: string, answer: number):Types.PollState | boolean => { // 票の追加
    if (!(pollId in pollDatas)) return Types.PollState.NotFund;
    if (!pollDatas[pollId].voters[userId]) pollDatas[pollId].voters[userId] = {
        id: userId,
        answer: []
    };
    pollDatas[pollId].voters[userId].answer.push(answer);
    return true;
}