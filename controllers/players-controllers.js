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
    selectPlayerById(userId).then((player) => {
        response.status(200).send({player})
    }).catch((error) => {
        next(error)
    })
}