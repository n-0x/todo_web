type ConfigType = {
    auth: {
        salt_rounds: number,
        expiry: number
    }
}
const config:ConfigType = {
    auth: {
        salt_rounds: 12,
        expiry: 86400
    }
}
export default config;