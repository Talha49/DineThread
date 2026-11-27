# DineThread

DineThread lets guests order from a restaurant’s QR menu and follow their order. Staff manage dishes, prices and incoming orders from the dashboard.

- [Open the live DineThread website](https://dinethread-group7.vercel.app/)
- [View the five studies and test results](https://github.com/Talha49/DineThread/tree/cf67404a5663baf844b479f939f4bfc78c45f574/research-records)

## Run locally

1. Start MongoDB and create a `.env.local` file in the project root. Set `MONGODB_URI` to the connection string for your DineThread database and `AUTH_SECRET` to a private, randomly generated value.
2. Run `npm ci`, then `npm run dev`.
3. Open the local address printed in the terminal. On a fresh database, sign up, create a restaurant, and add a category, a dish and a table. The dashboard provides the link to that restaurant’s public menu.

## Public URL

For a custom domain, set `SITE_URL` to the public origin for this DineThread deployment. On Vercel the app can use the project URL automatically. Restaurant accounts and menus come from the database configured for that deployment.

Set `NEXT_PUBLIC_CONTACT_EMAIL` to a monitored DineThread inbox before building. The contact and account-help pages open an email addressed to that inbox. After changing the address on Vercel, rebuild the deployment.
