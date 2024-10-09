type ConfigType = {
    auth: {
        salt_rounds: number,
        access_expiry: number,
        refresh_expiry: number,
    }
}
const config:ConfigType = {
    auth: {
        salt_rounds: 12,
        access_expiry: 300, // 5 min
        refresh_expiry: 14 // expiry in days
    }
}
export default config;