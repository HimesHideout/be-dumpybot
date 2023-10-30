const {selectPlayers} = require("../models/players-models");
exports.getPlayers = (request, response, next) => {
    selectPlayers().then((players) => {
        response.status(200).send({ players });
    }).catch((error) => {
        next(error)
    })
}