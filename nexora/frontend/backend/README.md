# Nexora backend

## Local setup

1. Make sure MongoDB is running locally on `127.0.0.1:27017`.
2. Copy `.env.example` to `.env`. Set `MONGODB_URI` and `MONGODB_DB_NAME` if your local MongoDB uses different settings or authentication.
3. Install dependencies with `npm install`.
4. From this directory, verify the connection with `npm run mongo:check`, then apply the ordered MongoDB migrations with `npm run migrate`. Migrations create the collections' indexes and record completed versions in the `_migrations` collection; they are safe to run again.
5. Set `SEED_ADMIN_EMAIL` and a unique `SEED_ADMIN_PASSWORD` of at least 12 characters, then run `npm run seed` to create or promote the platform administrator account. Optionally set `SEED_ADMIN_NAME` to customize its display name.
6. Start the API with `npm start`.

Sign in with the seeded account and open `/admin` in the frontend to manage users and workspaces. The admin API independently enforces the platform administrator role. Disabling a user revokes their sessions; platform administrator accounts cannot be disabled from the console.

The API listens on `PORT` (5000 by default). The frontend origin must be included in `CORS_ORIGINS` when it is not one of the local defaults. Production deployments must configure `MONGODB_URI` and use HTTPS. Pending MongoDB migrations are applied automatically on backend startup.

## Import existing MySQL data

The backend now reads and writes application data in MongoDB. To copy existing records from the former MySQL database:

1. Back up the MySQL database and make sure MongoDB is running.
2. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env` for the source database. Set `MONGODB_URI` and `MONGODB_DB_NAME` for the target.
3. Stop applications that write to MySQL, then run `npm run migrate:mysql-to-mongo`.
4. Verify the copied records in MongoDB before starting the API.

The transfer copies the 21 known tables into collections with the same names and preserves application IDs and fields. It is safe to re-run to add missing records; it does not overwrite existing MongoDB records, delete data from either database, or synchronize records deleted from MySQL. File metadata is copied, but uploaded file contents are stored separately: keep or copy the configured `STORAGE_DIRECTORY` so those files remain accessible. Keep the MySQL backup until the MongoDB data is verified.

## Optional integrations

Email delivery requires `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`, and `APP_BASE_URL`. AI chat is disabled until `AI_BASE_URL`, `AI_MODEL`, and `AI_API_KEY` are configured. When enabled, chat messages are sent to that configured provider. Uploads are limited to five files, 10 MB per file and 20 MB per request, and are stored under the configured private `STORAGE_DIRECTORY`.

Two-factor authentication and email verification return an explicit unavailable response until their full verification flows are configured.

## Checks

Run backend unit, integration, and HTTP-level tests with `npm test`. Run `npm audit` after dependency changes.
