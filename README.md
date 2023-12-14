# Backend - DumpyBot

## Endpoints 

Here are a list of the available endpoints on the server: 

| REST  |       Endpoint        | Description                       | Body Format                | Queries |
|-------|:---------------------:|-----------------------------------|----------------------------|---------|
| GET   |     `api/players`     | Gets all available players        |                            |         |
| PUT   |                       | Adds a new player                 | `{ userId: id }`           |         |
| GET   | `api/players/:userId` | Gets a player by their discord ID |                            |         |
| PATCH |                       | Updates a player property         | `{ incr_balance: +/-INT }` |         |


## Setup

### Creating Tables on AWS

On your AWS account, you will need a few tables set up: One for the players, and another for the items. The names of these tables can be defined with the `DYNAMO_{Table}_TABLE` environment variables (see **.env Files** below).

The four tables you should need to make are as follows:

- Players Table (Development)
- Items Table (Development)
- Players Table (Testing)
- Items Table (Testing)

How you name these tables is up to you but make sure you reflect that naming in the `.env` files so that schemas are properly applied when running tests.

We've added an automatic script for creating the tables in `database/apply-schemas.js`. You can run it as:

`npm run apply-schemas`

This script also runs during the tests to create the test tables.

### Installing Packages

For setup, `npm install` all the packages for the project.

#### WARNING IF YOU ARE A WINDOWS USER:

This repo uses `NODE_ENV`, which isn't natively supported by Windows.

To solve this, please run the following command:

`npm install -g win-node-env`

This will ensure all NODE_ENV commands in this project and future projects are handled properly.

### .env Files

There are **3** .env files you will need: `.env.test`, `.env.development` and `.env.production`. They should all
contain the following keys:

```dotenv
# AWS
AWS_DEFAULT_REGION=yourRegion
AWS_ACCESS_KEY_ID=yourId
AWS_SECRET_ACCESS_KEY=yourSecret
DYNAMO_PLAYERS_TABLE=yourPlayerTable
DYNAMO_ITEMS_TABLE=yourItemsTable

# AUTH0
AUTH_URL=https://dev-yourCode.us.auth0.com/oauth/token
AUTH_AUDIENCE=http://your-audience.com
AUTH_CLIENT_ID=yourAuthClient
AUTH_CLIENT_SECRET=yourAuthSecret
```

These should all reflect the specific account and table you'd like to use in the backend.

Make sure your dynamo table name is correct as well!

For example, your **test .env** might have 
```dotenv
DYNAMO_PLAYERS_TABLE=test-players
DYNAMO_ITEMS_TABLE=test-items
```
and then your **development .env** may have:
```dotenv
DYNAMO_PLAYERS_TABLE=dev-players
DYNAMO_ITEMS_TABLE=dev-items
```

How you name them is up to you, but double-check you have the right information in each env file respectively.

### Adding`jwt-info.json`

In order for the app to work properly, you also need a file in the `be-dumpybot/data` folder called `jwt-info.json`.

This file should contain the following JSON:

```json
{
  "audience": "yourAudienceUrl",
  "issuerBaseURL": "https://dev-yourCode.us.auth0.com/oauth/token",
  "tokenSigningAlg": "yourSigningAlgorithm"
}
```

## Test Suite

This project uses the test suite [Jest](https://jestjs.io/) to test the api and make sure all endpoints work as intended.

To use the test suite, run `npm test` to ensure all endpoints are working as desired before running the server.

## Running the server

To run the server locally, first run `npm run dev` to activate the server.

All information on the available endpoints can be accessed on http://localhost:9090/api.

All GET requests can be done by following the desired endpoint. For POST, PATCH and DELETE, please use a REST client.