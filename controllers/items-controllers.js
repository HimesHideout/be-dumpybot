const { selectItems, selectItemById, insertItem, removeItemById, updateItemById } = require("../models/items-models");

exports.getItems = (request, response, next) => {
    selectItems().then((items) => {
        response.status(200).send({ items });
    }).catch((error) => {
        next(error)
    })
}

exports.getItemById = (request, response, next) => {
    const { itemId } = request.params;
    if (! /^\d+$/.test(itemId)) {
        response.status(400).send({msg: "Invalid itemId format"})
    }
    selectItemById(itemId).then((item) => {
        response.status(200).send({item})
    }).catch((error) => {
        next(error)
    })
}

exports.insertItem = (request, response, next) => {
    const item = request.body
    insertItem(item).then((item) => {
        response.status(200).send({item})
    }).catch((error) => {
        next(error)
    })
}

//TODO: Make it return 404 when updating an item that doesn't exist.
exports.updateItemById = (request, response, next) => {
    const {itemId} = request.params
    const item = request.body
    updateItemById(itemId, item).then((item) => {
        response.status(200).send({item})
    }).catch((err) => {
        next(err)
    })
}

exports.deleteItemById = (request, response, next) => {
    const {itemId} = request.params
    const promises = [selectItemById(itemId), removeItemById(itemId)]
    Promise.all(promises).then((resolvedPromises) => {
        response.status(204).send()
    }).catch((error) => next(error))
}