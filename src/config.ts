type ConfigType = {
    auth: {
        salt_rounds: number,
        access_expiry: number,
        refresh_expiry: number | string,
    }
}
const config:ConfigType = {
    auth: {
        salt_rounds: 12,
        access_expiry: 300, // 5 min
        refresh_expiry: '2w'
    }
}
export default config;