## A simple task-overview web-app+
### Auth
The user can create a account, which will trigger an api-call to `/api/singup`. This will add their hash along with salt to the `postgres-db`.

When loging in, the hash is confirmed with the hash from the database and if matched, the session-cookie is added to the client.