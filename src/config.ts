import { Time } from "./lib/server/constants";

const config = {
    auth: {
        salt_rounds: 12,
        access_expiry: 3 * Time.SECONDS,  // expiry in seconds
        web_expiry: 14 * Time.DAYS,    // expiry of web-token in days
        api_expiry: 14,      // expiry of api-token in seconds
        jwt: {
            alg: 'HS256',
            issuer: 'me',
        }
    },
    general: {
        enforceHTTPS: false // change to true
    }
}
export default config;