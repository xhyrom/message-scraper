import fs from 'node:fs/promises';
import { timestampToTime } from '../utils/timestampToTime';
import { FileType } from './Scraper';
import { JSDOM } from 'jsdom';
import { replaceBeforeMarkdown, replaceAfterMarkdown } from '../utils/replaceMarkdown';
import higlightjs from 'highlight.js';
import { marked } from 'marked';

const dom = new JSDOM();
const document = dom.window.document;

marked.setOptions({
    highlight: (code) => {
      return higlightjs.highlightAuto(code).value;
    }
});

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
        if (this.fileType === FileType.Html) {
            const parentContainer = document.createElement("div");
            parentContainer.className = "parent-container";

            const avatarDiv = document.createElement("div");
            avatarDiv.className = "avatar-container";

            const avatar = m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.webp` : `https://cdn.discordapp.com/embed/avatars/${m.author.discriminator % 5}.png`
            const img = document.createElement('img');
            img.setAttribute('src', avatar);
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

            const msgNode = document.createElement('span');
            msgNode.className = 'msg';
            msgNode.innerHTML = replaceAfterMarkdown(marked(replaceBeforeMarkdown(m.content)));
            messageContainer.appendChild(msgNode);

            if (m.attachments && m.attachments.length !== 0) {
                for (const attachment of m.attachments) {
                    const attachmentDiv = document.createElement('div');

                    if (attachment.content_type?.includes('image')) {
                        attachmentDiv.className = 'attachment image';

                        const a = document.createElement('a');
                        a.href = `https://media.discordapp.net/attachments/${this.channelId}/${attachment.id}/${attachment.filename}`;
                        a.tabIndex = 0;
                        a.target = '_blank';

                        const image = document.createElement('img');
                        image.src = `https://media.discordapp.net/attachments/${this.channelId}/${attachment.id}/${attachment.filename}`;
                        image.width = attachment.width > 400 ? 400 : attachment.width;
                        image.height = attachment.height > 300 ? 300 : attachment.height;
    
                        a.appendChild(image);
                        attachmentDiv.appendChild(a);
                    } else if (attachment.content_type) {
                        attachmentDiv.className = 'attachment video';

                        const video = document.createElement('video');
                        video.src = `https://media.discordapp.net/attachments/${this.channelId}/${attachment.id}/${attachment.filename}`;
                        video.className = 'video-player';
                        video.controls = true;
                        video.playsInline = true;
    
                        attachmentDiv.appendChild(video);
                    } else {
                        attachmentDiv.className = 'attachment invalid';

                        const inner = document.createElement('div');
                        inner.className = 'inner';

                        const a = document.createElement('a');
                        a.className = 'name';
                        a.textContent = attachment.filename;
                        a.href = `https://media.discordapp.net/attachments/${this.channelId}/${attachment.id}/${attachment.filename}`;
                        a.tabIndex = 0;
                        a.target = '_blank';

                        const size = document.createElement('span');
                        size.className = 'size';
                        size.textContent = attachment.size;

                        inner.append(a);
                        inner.append(size);
    
                        attachmentDiv.appendChild(inner);
                    }

                    messageContainer.appendChild(attachmentDiv);
                }
            }

            if (m.sticker_items && m.sticker_items.length !== 0) {
                for (const sticker of m.sticker_items) {
                    const attachmentDiv = document.createElement('div');
                    attachmentDiv.className = 'attachment image';

                    const att = document.createElement('a');
                    att.href = `https://media.discordapp.net/stickers/${sticker.id}.webp?size=160`;
                    att.tabIndex = 0;
                    att.target = '_blank';

                    const image = document.createElement('img');
                    image.src = `https://media.discordapp.net/stickers/${sticker.id}.webp?size=160`;
                    image.className = 'attachment-image-size';

                    att.appendChild(image);

                    attachmentDiv.appendChild(att);
                    messageContainer.appendChild(attachmentDiv);
                }
            }

            parentContainer.appendChild(messageContainer);

            await fs.appendFile(this.path, parentContainer.outerHTML).catch(err => console.log(err));
        }

        if (m.sticker_items && m.sticker_items.length !== 0) m.content += ` ${m.sticker_items.map(s => `https://media.discordapp.net/stickers/${s.id}.webp?size=160`).join(' ')};`
        if (m.attachments && m.attachments.length !== 0) m.content += ` ${m.attachments.map(a => a.url).join(' ')}`;

        await fs.appendFile(`output/channel_${this.channelId}/channel.txt`, `[${m.id} | ${timestampToTime(m.timestamp)}] (${m.id}) ${m.author.username}#${m.author.discriminator} -> ${m.content}  \n`).catch(e => e);
        if (this.fileType === FileType.Markdown) await fs.appendFile(this.path, `[${m.id} | ${timestampToTime(m.timestamp)}] (${m.id}) ${m.author.username}#${m.author.discriminator} -> ${m.content}  \n`).catch(e => e);

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
        else await fs.writeFile(`output/channel_${this.channelId}/channel.txt`, write).catch(e => e);
    }
}