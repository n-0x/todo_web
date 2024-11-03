import { TimeUnit } from "./lib/server/constants";

const config = {
    auth: {
        salt_rounds: 12,
        token_epxiry: 14 * TimeUnit.DAYS,
        token_renew: 10 * TimeUnit.MINUTES,
    }
}
export default config;