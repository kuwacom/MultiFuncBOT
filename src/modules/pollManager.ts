import Discord from "discord.js";
import moment from "moment";
import * as Types from "./types"
import { randRange } from "./utiles";

export const pollData: { [pollId: number]: Types.PollData} = {};

export const getPollData = (pollId: number): Types.PollData | null => {
    if (!(pollId in pollData)) return null;
    return pollData[pollId];
}

export const createPoll = (title: string, description: string): Types.PollData | null => {
    const id = randRange(1000000, 9999999);
    if (!(id in pollData)) return null;
    return {
        id: id,
        title: title,
        description: description,
        time: moment().unix(),
        voters: []
    }
}

export const addVoter = (pollId: number, userId: string, answer: number)