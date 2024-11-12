import { TimeUnit } from "./lib/server/constants";

const config = {
    auth: {
        salt_rounds: 12,
        token_epxiry: 14 * TimeUnit.DAYS,
        api: {
            refresh: 1 * TimeUnit.HOURS
        },
        web: {
            refresh: 4 * TimeUnit.HOURS
        }
    }
}
export default config;