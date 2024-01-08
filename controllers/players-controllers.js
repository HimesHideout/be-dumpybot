const {selectPlayers, selectPlayerById, updatePlayerById, insertPlayer, removePlayerById, getPlayerInventory, addItemtoPlayerInventory, removeItemFromPlayerInventory} = require("../models/players-models");

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

exports.insertPlayer = (request, response, next) => {
    const playerId = request.body.userId
    insertPlayer(playerId).then((player) => {
        response.status(200).send({player})
    }).catch((error) => {
        next(error)
    })
}

exports.patchPlayerById = (request, response, next) => {
    const {userId} = request.params
    const patch = request.body
    const promises = [selectPlayerById(userId), updatePlayerById(userId, patch)]
    Promise.all(promises).then(resolvedPromises => {
        response.status(200).send({player: resolvedPromises[1]})
    }).catch(err => next(err))
}

exports.deletePlayerById = (request, response, next) => {
    const {userId} = request.params
    const promises = [selectPlayerById(userId), removePlayerById(userId)]
    Promise.all(promises).then((resolvedPromises) => {
        response.status(204).send()
    }).catch((error) => next(error))
}

exports.getPlayerInventory = (request, response, next) => {
    const {userId} = request.params
    const {page, itemsPerPage} = request.query
    getPlayerInventory(userId, page, itemsPerPage).then((inventory) => {
        response.status(200).send({inventory})
    }).catch((error) => next(error))
}

exports.addItemtoPlayerInventory = (request, response, next) => {
    const {userId} = request.params
    const {itemId, quantity} = request.body
    addItemtoPlayerInventory(userId, itemId, quantity).then((result) => {
        response.status(200).send(result)
    }).catch((error) => next(error))
}

exports.removeItemFromPlayerInventory = (request, response, next) => {
    const {userId} = request.params
    const {itemId, quantity} = request.body
    removeItemFromPlayerInventory(userId, itemId, quantity).then(() => {
        response.status(204).send()
    }).catch((error) => next(error))
}