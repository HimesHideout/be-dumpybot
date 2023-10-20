const express = require("express");
const cors = require('cors');
const {handle404s, handleServerError} = require("./error-handler");
const {getEndpoints} = require("./controllers/api-controllers");

const app = express();

app.use(cors());
app.use(express.json());

// Endpoints
app.get("/api", getEndpoints);

// Error Handling
app.use((req, res) => {
    res.status(404).send({ msg: "url not found" });
});

app.use(handle404s);
app.use(handleServerError);

module.exports = app;