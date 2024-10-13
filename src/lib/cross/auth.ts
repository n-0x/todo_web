export function parseJWT(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
}