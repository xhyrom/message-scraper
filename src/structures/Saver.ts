import Util from 'hyttpo/dist/js/util/utils';
import fs from 'node:fs/promises';

export class Saver {
    array: Array<any>;
    channelId: string;
    constructor(channelId: string, array: Array<any>) {
        this.array = array;
        this.channelId = channelId;

        this.setup();
    }

    public static async cache(cacheData: Array<any>, channelId: string) {
        let data: any = await fs.readFile(`.cache/${channelId}.json`, 'utf-8').catch(e => []) as string;
        if (!data || !Util.isJSON(data)) data = [] as any;
        else data = JSON.parse(data);

        for (const dt of cacheData) {
            data.push(dt);
        }

        fs.writeFile(`.cache/${channelId}.json`, JSON.stringify(data, null, 2));
    }

    private async setup() {
        await this.createFolder();
        await this.saveAsTxtFile();
        await this.saveAsJsonFile();
    }

    private async createFolder() {
        fs.mkdir('output').catch(e => e);
    }

    private saveAsTxtFile() {
        let data = "MESSAGE ID, AUTHOR ID, CONTENT\n";
        for(const a of this.array) {
            data += `${a.id}, ${a.author.id}, ${a.content}\n`;
        }

        fs.writeFile(`output/${this.channelId}.txt`, data);
    }

    private saveAsJsonFile() {
        fs.writeFile(`output/${this.channelId}.json`, JSON.stringify(this.array, null, 2)).catch(e => e);
    }
}