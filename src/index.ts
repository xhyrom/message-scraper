import prompts, { PromptObject } from 'prompts';
import { FileType, Scraper } from './structures/Scraper';

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
            type: 'select',
            name: 'fileType',
            message: 'Select type of file',
            choices: [
                {
                    title: 'Txt File', value: 1
                },
                {
                    title: 'Markdown File', value: 2
                },
                {
                    title: 'Html File', value: 3
                }
            ]
        },
        {
            type: 'text',
            name: 'afterMessageId',
            message: 'Enter the id of the message after which messages will be scraped (optional).'
        }
    ]
}

(async() => {
    const response = await prompts(questions());

    if (!response.token || !response.channelId || !response.fileType) return process.exit(1);

    new Scraper(response.token, response.channelId, response.fileType as FileType, response.afterMessageId);
})();