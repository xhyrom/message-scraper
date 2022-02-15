import prompts, { PromptObject } from 'prompts';
import { Scraper } from './structures/Scraper';

export const questions = (): Array<PromptObject> => {
    return [
        {
            type: 'password',
            name: 'token',
            message: 'Enter your user token.'
        },
        {
            type: 'text',
            name: 'channelId',
            message: 'Enter a channel id.'
        },
        {
            type: 'text',
            name: 'firstMessageId',
            message: 'Enter a first message id.'
        }
    ]
}

(async() => {
    const response = await prompts(questions());

    if (!response.token || !response.channelId || !response.firstMessageId) return process.exit(1);

    new Scraper(response.token, response.channelId, response.firstMessageId);
})();