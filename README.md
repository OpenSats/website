# MAGIC Grants Campaign Site

## Creating a New Donation Campaign

The core of a donation campaign lives in `/docs/<fund>/projects`.

Create a new `.md` file in the `project` folder for the Fund that you are interested in. The name of the `.md` file will be the end part of the public YRL.

You will need to make a new branch to propose a change in a pull request.

In the new `.md` file, please the following at the top:

```
fund: fund_name (required, eg: firo, monero, general)
title: 'String' (required)
summary: 'String' (required)
nym: 'String' (required, the author)
coverImage: '' (optional but recommended)
website: 'String' (optional, link for the title text)
socialLinks:
  - 'string' (optional, add more list items for multiple)
date: 'YYYY-MM_DD' (required)
goal: Number (required, in USD)
```

When merged, this will open a new donation campaign that is set to require funding.

### Adding a Cover Image

The cover image (`coverImage`) should be placed in `/public/img/project/`. For the `coverImage` value, use `/img/project/<image file name>`, eg `/img/project/firo-curve-trees.png`.

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

This makes you able to test Stripe donations in the Monero fund, which should be enough for development. You can add random values to the other Stripe environment variables to bypass validation.

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

## Infrastructure

This repository consists of several relayed deployments:

* The campaign website, donate.magicgrants.org
* BTCPay Server, btcpay.magicgrants.org
  * Monero daemon
  * View-only Monero wallet
  * Bitcoin daemon
  * View-only Bitcoin wallet
* Keycloak, keycloak.magicgrants.org

Separate repositories are used for:

* Auto-forwarding Bitcoin and Monero to Kraken, then auto-converting to USD: https://github.com/MAGICGrants/autoforward-autoconvert
* Perks management/administration: https://github.com/MAGICGrants/strapi

## Contributing

Pull requests welcome! Thanks for supporting MAGIC Grants.

## License

Thanks to Open Sats for their initial version of this website, which has been modified significantly. Thanks to BTCPay Server for Bitcoin and Monero payment processing.

[MIT](LICENSE)