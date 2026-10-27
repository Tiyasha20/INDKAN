# INDKAN Pulses & Spices

A full-stack demonstration project for INDKAN World Wide Exim LLC, built as a responsive business website and enquiry API. Product records and all product specifications in this starter are **illustrative** until confirmed by the company.

## Project structure

```text
shared/products.json        Shared illustrative product catalogue
website/                    React + Vite website
server/                     Express REST API and optional MongoDB storage
```

## Requirements

- Node.js 20 or newer and npm
- Optional MongoDB database for persistent enquiry storage

## Run locally

Install dependencies in each app folder:

```sh
cd website && npm install
cd ../server && npm install
```

Start the API from `server/`:

```sh
cp .env.example .env
npm run dev
```

Start the website from `website/` in another terminal:

```sh
cp .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The default website API URL is `http://localhost:4000/api`.

## Environment configuration

### API (`server/.env`)

Copy `server/.env.example` and set:

- `PORT`: API port, default `4000`.
- `MONGODB_URI`: optional Mongo connection string. When present and reachable, enquiries are written via the Mongoose model. Without it, development enquiries append to `server/data/enquiries.json`. That local file is ignored by Git and is not shared or backed up.
- `ALLOWED_ORIGINS`: comma-separated website origins, for example `http://localhost:5173,https://your-site.vercel.app`. Set the deployed website origin for production.
- `NODE_ENV`: set to `production` on the host.

The API health endpoint reports the active storage mode. A Render instance using local JSON storage should be treated as ephemeral; configure MongoDB for durable production enquiries.

### Website (`website/.env`)

Set `VITE_API_URL` to the API base URL, without a trailing slash, such as `https://your-api.onrender.com/api`.

## Features

- Responsive home, about, product catalogue, packaging/supply, enquiry and contact sections.
- Category filters, product search, no-results state and product detail dialog.
- Business enquiry form with required field, email and phone validation, loading, API error and success states.
- Shared product catalogue in `shared/products.json`, consumed by the website and API.
- Express endpoints for health, categories, products, product details and enquiry submission.
- MongoDB via Mongoose when configured, with local JSON development storage fallback.

## API

Base path: `/api`

| Method | Path                                     | Purpose                      |
| ------ | ---------------------------------------- | ---------------------------- |
| GET    | `/health`                                | Server and storage status    |
| GET    | `/categories`                            | Catalogue categories         |
| GET    | `/products?category=Pulses&search=chick` | Filter products              |
| GET    | `/products/:id`                          | Retrieve a product           |
| POST   | `/enquiries`                             | Validate and save an enquiry |

`POST /enquiries` accepts JSON fields `fullName`, `companyName`, `email`, `phone`, `country`, `city`, `buyerType`, and `category`; `product`, `quantity`, `packaging`, and `message` are optional. It returns HTTP 201 only after storage succeeds. Enquiry records are never returned through a public listing endpoint. A basic in-memory per-IP throttle limits submissions to eight per minute per server process.

## Build checks

```sh
npm run build:web
npm --prefix server audit
npm --prefix website audit
```

The website production build has been completed. API smoke checks covered health status, product list/detail, unknown-product 404, invalid enquiry rejection (400), and successful local enquiry storage (201); the temporary test enquiry was removed afterwards. Dependency audits were run for the website and API.

## Deployment preparation

- **Website:** import the repository into Vercel with Root Directory `website`, framework preset Vite, and environment variable `VITE_API_URL` pointing at the deployed API. `website/vercel.json` provides SPA fallback routing.
- **API:** `server/render.yaml` prepares a Render web service. Configure `MONGODB_URI` and `ALLOWED_ORIGINS` in the Render dashboard. Allow the deployed Vercel origin in `ALLOWED_ORIGINS`.

No deployment URL or GitHub remote is configured in this workspace.

## Company facts and content to verify

The official website and social references provided for the assignment could not be retrieved in the available review session. Consequently, this project only uses the company name and product focus supplied in the brief. Catalogue items, images, availability, packaging, supply, commercial terms, history, contact details, certifications and destinations are not represented as verified company claims. Replace illustrative content and confirm brand assets and contact information before public launch. Current image URLs are third-party Unsplash images and are not official INDKAN packaging.

## How the data flows

The website and API import the same JSON catalogue. The browser calls `GET /api/products` to load the catalogue, and the enquiry form sends JSON to `POST /api/enquiries`. The Express handler validates and strips markup, then writes the record through Mongoose when MongoDB is connected, or to an ignored local JSON file in development. MongoDB connection settings remain in the API environment; frontend environment values only contain public API URLs.
