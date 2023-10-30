# Backend - DumpyBot

## Setup

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

AWS_DEFAULT_REGION=yourRegion
AWS_ACCESS_KEY_ID=yourId
AWS_SECRET_ACCESS_KEY=yourSecret
```

These should all reflect the specific account and table you'd like to use for the backend.

## Test Suite

This project uses the test suite [Jest](https://jestjs.io/) to test the api and make sure all endpoints work as intended.

To use the test suite, run `npm test` to ensure all endpoints are working as desired before running the server.

## Running the server

To run the server locally, first run `npm run dev` to activate the server.

All information on the available endpoints can be accessed on http://localhost:9090/api.

All GET requests can be done by following the desired endpoint. For POST, PATCH and DELETE, please use a REST client.