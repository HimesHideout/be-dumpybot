const {ddbDocClientFull} = require("../database/connection");
const uuid = require("uuid")
const {selectAll, selectById, removeById, insert} = require("./base-models");

exports.selectItems = () => {

    return selectAll(process.env.DYNAMO_ITEMS_TABLE)

}

exports.selectItemById = (itemId) => {

    return selectById(process.env.DYNAMO_ITEMS_TABLE, "itemId", itemId)

}

exports.insertItem = (item) => {
    let itemId = ""

    if (item.name === undefined || item.name === "") {
        return Promise.reject({status: 400, msg: "Item name is required"});
    }


    if (item.itemId === undefined || item.itemId === "") {
        itemId = uuid.v4()
    } else {
        itemId = item.itemId
    }

    const itemParams = {
        itemId: itemId,
        //Default parameters.
        description: "",
        cost: 0,
        isStackable: true,
        //Override defaults with passed parameters.
        ...item
    }

    return insert(process.env.DYNAMO_ITEMS_TABLE, itemParams, "itemId", itemId)

}

exports.updateItemById = (itemId, item) => {
    const itemKeys = Object.keys(item)

    const params = {
        TableName: process.env.DYNAMO_ITEMS_TABLE,
        Key: {
            itemId: itemId
        },
        UpdateExpression: `SET ${
            itemKeys.map((_, index) => 
                `#field${index} = :value${index}`
            ).join(", ")
        }`,
        ConditionExpression: "attribute_exists(itemId)",
        //This weird contraption lets us use dynamic properties
        //when updating the item.
        ExpressionAttributeNames: itemKeys.reduce(
            (accumulator, key, index) => ({
                ...accumulator,
                [`#field${index}`]: key
            })
        , {}),
        ExpressionAttributeValues: itemKeys.reduce(
            (accumulator, key, index) => ({
                ...accumulator,
                [`:value${index}`]: item[key]
            })
        , {}),
        ReturnValues: "ALL_NEW"
    }

    return ddbDocClientFull.update(params)
        .then((data) => {
            return data.Attributes
        }).catch((error) => {
            if (error.name === "ConditionalCheckFailedException") {
                return Promise.reject({status: 404, msg: "Item not found"});
            } else {
                return Promise.reject({status: 500, msg: "Error updating Item"});
            }
        })
}

exports.removeItemById = (itemId) => {

    return removeById(process.env.DYNAMO_ITEMS_TABLE, "itemId", itemId)

}