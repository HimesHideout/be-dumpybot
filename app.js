const express = require("express");
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const helmet = require("helmet")

const {handleErrors} = require("./error-handler");
const {getEndpoints, getSecret} = require("./controllers/api-controllers");
const {getPlayers, getPlayerById, patchPlayerById, insertPlayer, deletePlayerById} = require("./controllers/players-controllers");
const fs = require("fs");

const app = express();

const rawJwtRead = fs.readFileSync(`${__dirname}/data/jwt-info.json`, "utf-8")
const jwtData = JSON.parse(rawJwtRead)

const jwtCheck = auth(jwtData);

// enforce on all endpoints
// app.use(jwtCheck);

app.use(cors());
app.use(express.json());
app.use(helmet())

// Endpoints
app.get("/api", getEndpoints);
// noinspection JSCheckFunctionSignatures
app.get("/api/secret", jwtCheck, getSecret);

app.get("/api/players", getPlayers)

// noinspection JSCheckFunctionSignatures
app.put("/api/players", jwtCheck, insertPlayer)

app.get("/api/players/:userId", getPlayerById)

// noinspection JSCheckFunctionSignatures
app.patch("/api/players/:userId", jwtCheck , patchPlayerById)

app.delete("/api/players/:userId", jwtCheck, deletePlayerById)

// Error Handling
app.use((req, res) => {
    res.status(404).send({ msg: "url not found" });
});

app.use(handleErrors);

module.exports = app;