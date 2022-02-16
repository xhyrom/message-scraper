import fs from 'node:fs/promises';
import { timestampToTime } from '../utils/timestampToTime';

export class Saver {
    channelId: string;
    constructor(channelId: string) {
        this.channelId = channelId;

        this.setup();
    }

    public async addMessage(m: any): Promise<void> {
        return await fs.appendFile(`output/${this.channelId}.txt`, `(${m.id}/${timestampToTime(m.timestamp)}) ${m.author.username}#${m.author.discriminator} (${m.author.id}): ${m.content}\n`).catch(e => e);
    }

    private async setup(): Promise<void> {
        await this.createFolder();
        this.createTxtFile();
    }

    private async createFolder(): Promise<void> {
        return await fs.mkdir('output').catch(e => e);
    }

    private async createTxtFile(): Promise<void> {
        return await fs.writeFile(`output/${this.channelId}.txt`, 'MESSAGE ID, AUTHOR ID, CONTENT\n').catch(e => e);
    }
}