type ConfigType = Record<string, Record<string, string | number>>
const config:ConfigType = {
    auth: {
        salt_rounds: 12
    }
}
export default config;