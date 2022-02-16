import fs from 'node:fs/promises';
import { timestampToTime } from '../utils/timestampToTime';
import { FileType } from './Scraper';
import { JSDOM } from 'jsdom';

const dom = new JSDOM();
const document = dom.window.document;

export type FileName = 'channel.txt' | 'channel.md' | 'channel.html';

export class Saver {
    channelId: string;
    fileType: FileType;
    constructor(channelId: string, fileType: FileType) {
        this.fileType = fileType;
        this.channelId = channelId;

        this.setup();
    }

    get path(): string {
        return `output/channel_${this.channelId}/${this.fileName}`;
    }

    get fileName(): FileName {
        if (this.fileType === FileType.Markdown) return 'channel.md';
        else if (this.fileType === FileType.Html) return 'channel.html';
        else return 'channel.txt'
    }

    public async addMessage(m: any): Promise<void> {
        if (m.stickers && m.stickers.length !== 0) m.content += ` ${m.sticker_items.map(s => `https://media.discordapp.net/stickers/${s.id}.webp?size=160`).join(' ')};`
        if (m.attachments && m.attachments.length !== 0) m.content += ` ${m.attachments.map(a => a.url).join(' ')}`;

        if (this.fileType === FileType.Html) {
            const parentContainer = document.createElement("div");
            parentContainer.className = "parent-container";

            const avatarDiv = document.createElement("div");
            avatarDiv.className = "avatar-container";
            const img = document.createElement('img');
            img.setAttribute('src', `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.webp`);
            img.className = "avatar";
            avatarDiv.appendChild(img);

            parentContainer.appendChild(avatarDiv);

            const messageContainer = document.createElement('div');
            messageContainer.className = "message-container";

            const mainSpan = document.createElement("span");
            const nameElement = document.createElement("span");
            const timestmapElement = document.createElement("span");
            const name = document.createTextNode(`${m.author.username}#${m.author.discriminator}`);
            const timestamp = document.createTextNode(timestampToTime(m.timestamp));
            nameElement.appendChild(name);
            
            timestmapElement.className = 'timestamp';
            timestmapElement.appendChild(timestamp);

            mainSpan.appendChild(nameElement);
            mainSpan.appendChild(timestmapElement);
            messageContainer.append(mainSpan);

            if(m.content.startsWith("```")) {
                const codeNode = document.createElement("code");
                const textNode =  document.createTextNode(m.content.replace(/```/g, ""));
                codeNode.appendChild(textNode);
                messageContainer.appendChild(codeNode);
            }
            else {
                const msgNode = document.createElement('span');
                const textNode = document.createTextNode(m.content);
                msgNode.append(textNode);
                messageContainer.appendChild(msgNode);
            }

            parentContainer.appendChild(messageContainer);

            await fs.appendFile(this.path, parentContainer.outerHTML).catch(err => console.log(err));
        } else await fs.appendFile(this.path, `[${m.id} | ${timestampToTime(m.timestamp)}] (${m.id}) ${m.author.username}#${m.author.discriminator} -> ${m.content}  \n`).catch(e => e);
    
        return;
    }

    private async setup(): Promise<void> {
        await this.createFolder();
        this.createTypeFile();
    }

    private async createFolder(): Promise<void> {
        await fs.mkdir('output').catch(e => e);
        await fs.mkdir(`output/channel_${this.channelId}`).catch(e => e);
        return;
    }

    private async createTypeFile(): Promise<void> {
        let write = '';
        if (this.fileName === 'channel.md') write = '# MESSAGE ID, TIMESTAMP, AUTHOR ID, AUTHOR TAG, CONTENT  '
        else if (this.fileName === 'channel.txt') write = 'MESSAGE ID, TIMESTAMP, AUTHOR ID, AUTHOR TAG, CONTENT\n';
        else {
            await fs.copyFile(`${__dirname}/../templates/template.html`, this.path);
        }

        if (this.fileName !== 'channel.html') await fs.writeFile(this.path, write).catch(e => e);
    }
}