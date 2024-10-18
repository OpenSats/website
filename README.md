# MAGIC Grants Campaign Site

## Development

### Requirements

- Docker
- Docker Compose
- NodeJS >=20

### Running containers

First, install the application's dependencies and then run the containers:

```bash
$ npm i
```

```bash
$ docker-compse up -d
```

The app will be available at `http://localhost:3000`.

### Configuration

Create a `.env `file as a copy of `.env.example` and set the values for the empty variables.

### Setting up Keycloak

1. Open up http://localhost:8080 in your browser, then login using `admin` for both username and password;

2. Open the dropdown menu on the top left corner of the screen (where it says Keycloak) and click **Create realm**;

3. Upload the `realm-export.json` file from this repo, name the realm  `magic` and click **Create**;

4. Once the realm is created, go to **Clients** -> **Credentials**, and under **Client Secret**, click **Regenerate**. Copy the secret and add it to the `KEYCLOAK_CLIENT_SECRET` environment variable in your `.env` file.

### Setting up BTCPayServer

1. Open up http://localhost:49392 in your browser and create an account;

2. Once logged in, open the **XMR Wallet** page and upload a view-only wallet file, you can get one from [Feather Wallet](https://featherwallet.org/);

3. In the **Webhooks** tab, create a new webhook by setting the **Payload URL** to `http://campaign-site:3000/api/btcpay/webhook`, copy the secret and add it to the `BTCPAY_WEBHOOK_SECRET` environment variable in your `.env` file, and finally click **Add webhook**.

4. Create a new API key at **Account** -> **Manage Account** -> **API Keys**, you'll need the following permissions: **View invoices**, **Create an invoice** and **View your stores**. Then copy the API key and add it to the `BTCPAY_API_KEY` environment variable in your `.env` file.

### Setting up Stripe

1. Open up the [Stripe Dashboard](https://dashboard.stripe.com) in your browser;

2. Create a new account in test mode;

3. Go to **Developers** -> **API keys**, and get a secret key, add it to the `STRIPE_MONERO_SECRET_KEY` environment variable in your `.env` file;

4. Go to **Developers** -> **Webhooks**, and add a new webhook endpoint. Add `<Your app public address>/api/stripe/monero-webhook` to the URL field replacing `<Your app public address>` with your app's public address, then add the secret to the `STRIPE_MONERO_WEBHOOK_SECRET` environment variable in your `.env` file. To expose the app to the internet so Stripe can reach the webhook endpoint, you can use tunneling services like Visual Studio Code's built-in [port-forwarding feature](https://code.visualstudio.com/docs/editor/port-forwarding) or [Ngrok](https://ngrok.io).

This makes you able to test Stripe donations in the Monero fund, which should be enough for development. You can add random values to the other Stripe enviroment variables to bypass validation.

You are now all set up to start developing!

## Funding required endpoint

Endpoint: `GET /api/funding-required`

Request query parameters
| Parameter | Required | Default | Accepted values | Description |
| - | - | - | - | - |
| `fund` | No | - | `monero` `firo` `privacyguides` `general` | Filters projects by fund. |
| `asset` | No | - | `BTC` `XMR` `USD` | Only return project amounts and address for a specific asset. Specifying this parameter changes the response JSON schema as shown below. |
| `project_status` | No | `NOT_FUNDED` | `NOT_FUNDED` `FUNDED` `ANY` | Filters projects by status. |

Response body (`asset` parameter **not** specified)

```ts
[
    {
        title: string
        fund: 'monero' | 'firo' | 'privacyguides' | 'general'
        date: string // YYYY-MM-DD
        author: string
        url: string
        is_funded: boolean
        raised_amount_percent: number
        contributions: number
        target_amount_btc: number
        target_amount_xmr: number
        target_amount_usd: number
        remaining_amount_btc: number
        remaining_amount_xmr: number
        remaining_amount_usd: number
        address_btc: string | null
        address_xmr: string | null
    }
]
```

Response body (`asset` parameter specified)

```ts
[
    {
        title: string
        fund: 'monero' | 'firo' | 'privacyguides' | 'general'
        date: string // YYYY-MM-DD
        author: string
        url: string
        is_funded: boolean
        raised_amount_percent: number
        contributions: number
        asset: 'BTC' | 'XMR' | 'USD'
        target_amount: number
        remaining_amount: number
        address: string | null
    }
]
```

# Contributing

Pull requests welcome!
Thanks for supporting MAGIC Grants.

# License

[MIT](LICENSE)