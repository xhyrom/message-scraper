export const snowflakeToTimestamp = (snowflake, epoch = 1420070400000): number => {
    return new Date(snowflake / 4194304 + epoch).getTime()
}