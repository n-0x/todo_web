const config = {
    auth: {
        salt_rounds: 12,
        access_expiry: 3,  // expiry in seconds
        web_expiry: 14,    // expiry of web-token in days
        api_expiry: 5,      // expiry of api-token in seconds
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