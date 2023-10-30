const {selectPlayers, selectPlayerById} = require("../models/players-models");
exports.getPlayers = (request, response, next) => {
    selectPlayers().then((players) => {
        response.status(200).send({ players });
    }).catch((error) => {
        next(error)
    })
}

exports.getPlayerById = (request, response, next) => {
    const { userId } = request.params;
    if (! /^\d+$/.test(userId)) {
        response.status(400).send({msg: "Invalid userId format"})
    }
    selectPlayerById(userId).then((player) => {
        response.status(200).send({player})
    }).catch((error) => {
        next(error)
    })
}