const { selectByAttribute } = require("../models/base-models")

exports.getItemsInShop = (request, response, next) => {
    selectByAttribute(process.env.DYNAMO_ITEMS_TABLE, "isInShop", true).then((items) => {
        response.status(200).send({items})
    }).catch((error) => {
        next(error)
    })
}