import hyttpo from 'hyttpo';
import { getIdentifiers } from '../utils/getIdentifiers';
import { snowflakeToTimestamp } from '../utils/snowflakeToTimestamp';
import { Saver } from './Saver';

export class Scraper {
    token: string;
    channelId: string;
    cacheEnabled: boolean;
    firstMessageId: string;

    constructor(token: string, channelId: string, firstMessageId: string, cacheEnabled: boolean) {
        this.token = token;
        this.channelId = channelId;
        this.cacheEnabled = cacheEnabled;
        this.firstMessageId = firstMessageId;

        this.setup();
    }

    private async setup() {
        await this.checkToken();
        await this.checkChannel();
        await this.scrapeMessages();
    }

    private async checkToken() {
        const valid = await hyttpo.get('https://discord.com/api/v9/users/@me/guilds', {
            headers: {
                ...getIdentifiers(),
                'Authorization': this.token
            }
        }).catch(e => e);

        if (!valid.ok) return console.log('Error: Invalid token!');
    }

    private async checkChannel() {
        const valid = await hyttpo.get(`https://discord.com/api/v9/channels/${this.channelId}`, {
            headers: {
                ...getIdentifiers(),
                'Authorization': this.token
            }
        }).catch(e => e);

        if (!valid.ok) return console.log('Error: Invalid channel!');
    }

    private async scrapeMessages() {
        let allMessages = [];
        let afterMsg = this.firstMessageId;

        while(true) {
            const messages = await hyttpo.get(`https://discord.com/api/v9/channels/${this.channelId}/messages?limit=100${afterMsg.length > 0 ? `&after=${afterMsg}` : ""}`, {
                headers: {
                    ...getIdentifiers(),
                    'Authorization': this.token
                }
            }).catch(e => e);
    
            let msgs: Array<any> = messages.data;
            if (msgs.length === 0) continue;

            afterMsg = msgs[0].id;

            console.log(`Info: Scraped ${msgs.length} messages.`);
            msgs.map(m => allMessages.push(m));
            if(this.cacheEnabled) Saver.cache(allMessages, this.channelId);

            if (msgs.length < 100) {
                new Saver(this.channelId, allMessages.sort((a, b) => snowflakeToTimestamp(a.id) - snowflakeToTimestamp(b.id)));

                console.log(`Info: Getted ${allMessages.length} messages.`);
                break;
            }
        }
    }
}