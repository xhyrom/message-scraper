const fullFill = (a, limit?) => ('0'.repeat(69) + a.toString()).slice(limit ? -limit : -2);

export const timestampToTime = (ms) => {
    const date = new Date(ms);
    
    const day = fullFill(date.getDate());
    const month = fullFill(date.getMonth());
    const year = fullFill(date.getFullYear(), 4);
    
    const hours = fullFill(date.getHours());
    const mins = fullFill(date.getMinutes());
    const secs = fullFill(date.getSeconds());
    
    return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
}