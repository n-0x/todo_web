const config = {
    auth: {
        salt_rounds: 12,
        access_expiry: 3,  // expiry in seconds
        refresh_expiry: 14, // expiry in days
        access_mercy: 60,   // time in which the server still excepts expired acces tokens for edge-cases
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