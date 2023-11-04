# Backend - DumpyBot

## Setup

### Creating Tables on AWS

On your AWS account, you will need a few tables set up: `PRODUCTION`, `DEVELOPMENT` and `TEST` so that you can 
separate your data. You most importantly need the split between `test` and `dev/prod` so that the testing suite
may work.

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
DYNAMO_TABLE_NAME=yourTableName
#AUTH0
AUTH_URL=https://dev-yourCode.us.auth0.com/oauth/token
AUTH_AUDIENCE=http://your-audience.com
AUTH_CLIENT_ID=yourAuthClient
AUTH_CLIENT_SECRET=yourAuthSecret
```

These should all reflect the specific account and table you'd like to use in the backend.

Make sure your dynamo table name is correct as well!

For example, your **test .env** might have 
```dotenv
DYNAMO_TABLE_NAME=test_dumpy
```
and then your **development .env** may have:
```dotenv
DYNAMO_TABLE_NAME=development_dumpy
```

How you name them is up to you, but double check you have the right information in each env file respectively

## Test Suite

This project uses the test suite [Jest](https://jestjs.io/) to test the api and make sure all endpoints work as intended.

To use the test suite, run `npm test` to ensure all endpoints are working as desired before running the server.

## Running the server

To run the server locally, first run `npm run dev` to activate the server.

All information on the available endpoints can be accessed on http://localhost:9090/api.

All GET requests can be done by following the desired endpoint. For POST, PATCH and DELETE, please use a REST client.