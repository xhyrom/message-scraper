import { randomString } from "./randomString"

export const getIdentifiers = () => {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9001 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Accept-Language": "en-US",
        "Cookie": `__cfduid=${randomString(43)}; __dcfduid=${randomString(32)}; locale=en-US`,
        "TE": "Trailers",
        "origin": "https://discord.com",
        "Referer": "https://discord.com/channels/@me",
        "DNT": "1"
    }
}