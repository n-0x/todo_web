import { Time } from "./lib/server/constants";

const config = {
    auth: {
        salt_rounds: 12,
        access_expiry: 3 * Time.SECONDS,
        long_token_epxiry: 14 * Time.DAYS,         // expiry of `api_token` and `web_token`
        jwt: {
            alg: 'HS256',
            issuer: 'me',
        }
    }
}
export default config;