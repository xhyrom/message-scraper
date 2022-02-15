export const randomString = (len) => new Array(len).fill(0).map(x => {
    let ar = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
    return ar[Math.floor(Math.random() * ar.length)];
}).join("");