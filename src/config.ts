const config = {
    auth: {
        salt_rounds: 12,
        access_expiry: 10, // 5 min
        refresh_expiry: 14, // expiry in days
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