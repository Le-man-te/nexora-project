# Nexora backend

## Local setup

1. Copy `.env.example` to `.env` and set the MySQL connection values.
2. Create the database named by `DB_NAME` using MySQL 8 or later.
3. Install dependencies with `npm install`.
4. Apply the schema with `npm run migrate`.
5. Optionally set `SEED_ADMIN_EMAIL` and a unique `SEED_ADMIN_PASSWORD` of at least 12 characters, then run `npm run seed`.
6. Start the API with `npm start`.

The API listens on `PORT` (5000 by default). The Vite frontend origin must be included in `CORS_ORIGINS` when it is not one of the local defaults. Production deployments must use HTTPS, configure a non-empty database password, and set `TRUST_PROXY=true` only when the service is behind a trusted proxy.

## Database

`npm run migrate` applies ordered, recorded SQL migrations and can be run again safely. `database/schema.sql` can initialize a fresh database through the MySQL client. Never run the test schema against production data. `npm run seed` does not create a default account; credentials are provided through environment variables.

## Optional integrations

Email delivery requires `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`, and `APP_BASE_URL`. AI chat is disabled until `AI_BASE_URL`, `AI_MODEL`, and `AI_API_KEY` are configured. When enabled, chat messages are sent to that configured provider. Uploads are limited to five files, 10 MB per file and 20 MB per request, and are stored under the configured private `STORAGE_DIRECTORY`.

Two-factor authentication and email verification return an explicit unavailable response until their full verification flows are configured.

## Checks

Run all backend unit, integration, and HTTP-level tests with `npm test`. Run `npm audit` after dependency changes.
