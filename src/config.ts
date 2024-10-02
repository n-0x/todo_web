type ConfigType = {
    auth: {
        salt_rounds: number
    }
}
const config:ConfigType = {
    auth: {
        salt_rounds: 12
    }
}
export default config;