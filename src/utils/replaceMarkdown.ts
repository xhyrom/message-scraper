export const replaceBeforeMarkdown = (text: string): string => {
    text = text
        .replaceAll('-', '\\-');

    return text;
}

export const replaceAfterMarkdown = (text: string): string => {
    text = text
        .replaceAll('<strong>', '<b>')
        .replaceAll('</strong>', '</b>')
        .replaceAll('<em>', '<i>')
        .replaceAll('</em>', '</i>')
        .replaceAll('<blockquote>\n<p>', '> ')
        .replaceAll('</p>\n</blockquote>', '');

    return text;
}