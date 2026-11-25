# DineThread

DineThread lets guests order from a restaurant’s QR menu and follow their order. Staff manage dishes, prices and incoming orders from the dashboard.

## Run locally

1. Start MongoDB and create a `.env.local` file in the project root. Set `MONGODB_URI` to the connection string for your DineThread database and `AUTH_SECRET` to a private, randomly generated value.
2. Run `npm ci`, then `npm run dev`.
3. Open the local address printed in the terminal. On a fresh database, sign up, create a restaurant, and add a category, a dish and a table. The dashboard provides the link to that restaurant’s public menu.

## Public URL

For a custom domain, set `SITE_URL` to the public origin for this DineThread deployment. On Vercel the app can use the project URL automatically. Restaurant accounts and menus come from the database configured for that deployment.
