const express = require("express");
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

const {handleErrors} = require("./error-handler");
const {getEndpoints, getSecret} = require("./controllers/api-controllers");
const {getPlayers, getPlayerById, patchPlayerById} = require("./controllers/players-controllers");

const app = express();

const jwtCheck = auth({
    audience: 'http://localhost:9090',
    issuerBaseURL: 'https://dev-btw4il1186pitwdx.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});

// enforce on all endpoints
// app.use(jwtCheck);

app.use(cors());
app.use(express.json());

// Endpoints
app.get("/api", getEndpoints);
// noinspection JSCheckFunctionSignatures
app.get("/api/secret", jwtCheck, getSecret);

app.get("/api/players", getPlayers)

app.get("/api/players/:userId", getPlayerById)

// noinspection JSCheckFunctionSignatures
app.patch("/api/players/:userId", jwtCheck , patchPlayerById)

// Error Handling
app.use((req, res) => {
    res.status(404).send({ msg: "url not found" });
});

app.use(handleErrors);

module.exports = app;