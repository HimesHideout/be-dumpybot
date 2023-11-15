const {ddbDocClientFull} = require("../database/connection");
const uuid = require("uuid")

exports.selectItems = () => {

    const scanParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-items`
    }

    return ddbDocClientFull
        .scan(scanParams)
        .then((data) => {
            return data.Items
        })
}

exports.selectItemById = (itemId) => {
    const getParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-items`,
        Key: {
            itemId: itemId
        }
    }
    return ddbDocClientFull
        .get(getParams)
        .then((data) => {
            if (data.Item === undefined) {
                return Promise.reject({status: 404, msg: "Item not found"});
            } else {
                return data.Item
            }
        })
}

exports.insertItem = (item) => {
    if (item.name === undefined || item.name === "") {
        return Promise.reject({status: 400, msg: "Item name is required"});
    }
    let itemId = ""
    if (item.itemId === undefined || item.itemId === "") {
        itemId = uuid.v4()
    } else {
        itemId = item.itemId
    }

    const putParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-items`,
        Item: {
            itemId: itemId,
            //Default parameters.
            description: "",
            cost: 0,
            isStackable: true,
            //Override defaults with passed parameters.
            ...item
        }
    }
    
    return ddbDocClientFull
        .put(putParams)
        .then((data) => {
            if (data.$metadata.httpStatusCode === 200) {
                const getParams = {
                    TableName: `${process.env.DYNAMO_TABLE_PREFIX}-items`,
                    Key: {
                        itemId: itemId
                    }
                }
                return ddbDocClientFull
                    .get(getParams)
                    .then((data) => data.Item)
            } else {
                return Promise.reject({status: data.$metadata.httpStatusCode, msg: "Error inserting Item"});
            }
        })
}

exports.updateItemById = (itemId, item) => {
    //TODO
}

exports.removeItemById = (itemId) => {
    const deleteParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-items`,
        Key: {
            itemId: itemId
        }
    }

    return ddbDocClientFull
        .delete(deleteParams)
        .then((data) => {
            return data
        })
}