const {ddbDocClientFull} = require("../database/connection");
const {selectAll, selectById, removeById, insert} = require("./base-models");
const {selectItemById} = require("./items-models");

exports.selectPlayers = () => {

    return selectAll(process.env.DYNAMO_PLAYERS_TABLE)

}

exports.selectPlayerById = async (playerId) => {

    return selectById(process.env.DYNAMO_PLAYERS_TABLE, "userId", playerId)
}

exports.insertPlayer = (playerId) => {

    const itemParams = {
        userId: playerId,
        balance: 0,
        inventory: []
    }

    if (playerId === undefined || playerId === ""){
        return Promise.reject({ status: 400, msg: "userId is required" });
    }

    return insert(process.env.DYNAMO_PLAYERS_TABLE, itemParams, "userId", playerId)

}

exports.updatePlayerById = async (playerId, patch) => {

    const data = await ddbDocClientFull.get({TableName: process.env.DYNAMO_PLAYERS_TABLE, Key: {userId: playerId}})
    const player = data.Item

    if (patch.incr_balance && typeof patch.incr_balance !== "number") return Promise.reject({
        status: 400,
        msg: "invalid incr_balance type"
    })

    if (patch.incr_balance) {

        if (patch.incr_balance < 0 && player.balance + patch.incr_balance < 0) return Promise.reject({
            status: 400,
            msg: "insufficient balance for action"
        })

        const params = {
            TableName: process.env.DYNAMO_PLAYERS_TABLE,
            Key: {
                userId: playerId
            },
            UpdateExpression: "SET #A = #A + :a",
            ExpressionAttributeNames: {
                "#A": "balance"
            },
            ExpressionAttributeValues: {
                ":a": patch.incr_balance
            },
            ReturnValues: "ALL_NEW"
        }

        return ddbDocClientFull.update(params)
            .then((data) => {
                return data.Attributes
            })

    } else {
        return Promise.reject({
            status: 400,
            msg: "no valid patch values"
        })
    }
}

exports.removePlayerById = (playerId) => {

    return removeById(process.env.DYNAMO_PLAYERS_TABLE, "userId", playerId)

}

exports.getPlayerInventory = async (playerId, page=0, itemsPerPage=10) => {
    let userData = await this.selectPlayerById(playerId)
    let inventory = userData.inventory
    if (inventory.length < 1) {
        return []
    }
    //If page or itemsPerPage is 0 or negative, return all items.
    if (page > 0 && itemsPerPage > 0) {
        inventory = inventory.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        //If the page is out of range, return an empty array.
        if (inventory.length < 1) {
            return []
        }
    }
    let itemIds = inventory.map(item => {return {itemId: item.itemId}})
    let params = {
        RequestItems: {
            [process.env.DYNAMO_ITEMS_TABLE]: {
                Keys: itemIds
            }
        }
    }

    return ddbDocClientFull.batchGet(params)
        .then((data) => {
            let response = data.Responses[process.env.DYNAMO_ITEMS_TABLE]
            let order = inventory.map(item => item.itemId)
            response.sort((a, b) => order.indexOf(a.itemId) - order.indexOf(b.itemId))
            return response.map((item, index) => {
                    return {
                        ...item,
                        ...inventory[index]
                    }
                })
        }).catch((error) => {
            return Promise.reject({status: 500, msg: "Error getting player inventory."})
        })
}

exports.addItemtoPlayerInventory = async (playerId, itemId, quantity=1) => {
    if (quantity < 1) {
        return Promise.reject({status: 400, msg: "quantity must be greater than 0"})
    }
    let player = await this.selectPlayerById(playerId)
    let itemData = await selectItemById(itemId)
    
    const params = {
        TableName: process.env.DYNAMO_PLAYERS_TABLE,
        Key: {
            userId: playerId
        }
    }

    let item_in_inventory = player.inventory.some(item => item.itemId === itemId)
    if (!(item_in_inventory && itemData.isStackable)) {
        let item = {
            itemId: itemId,
            type: itemData.type || "Item",
            quantity: quantity || 1
        }
        params.UpdateExpression = "SET #I = list_append(#I, :i)"
        params.ExpressionAttributeNames = {
            "#I": "inventory"
        }
        params.ExpressionAttributeValues = {
            ":i": [item]
        }
    } else {
        let index = player.inventory.findIndex(item => item.itemId === itemId)
        params.UpdateExpression = `SET #I[${index}].quantity = #I[${index}].quantity + :q`
        params.ConditionExpression = `#I[${index}].itemId = :d`
        params.ExpressionAttributeNames = {
            "#I": "inventory"
        }
        params.ExpressionAttributeValues = {
            ":q": quantity,
            ":d": itemId
        }
    }

    return ddbDocClientFull.update(params)
        .then((data) => {
            return {
                "status": "success",
                "userId": playerId,
                "itemId": itemId,
            }
        }).catch((error) => {
            if (error.name === "ConditionalCheckFailedException") {
                return Promise.reject({status: 404, msg: "Index mismatch, please try again."})
            } else {
                return Promise.reject({status: 500, msg: "Error adding item."})
            }
        })
}

exports.removeItemFromPlayerInventory = async (playerId, itemId, quantity=1) => {
    if (quantity < 1) {
        return Promise.reject({status: 400, msg: "quantity must be greater than 0"})
    }
    let player = await this.selectPlayerById(playerId)
    let itemData = await selectItemById(itemId)
    
    const params = {
        TableName: process.env.DYNAMO_PLAYERS_TABLE,
        Key: {
            userId: playerId
        }
    }

    let item = player.inventory.find(item => item.itemId === itemId)
    if (item === undefined) {
        return Promise.reject({status: 404, msg: "Item not found in inventory"})
    } else if (itemData.isStackable && item.quantity > quantity) {
        let index = player.inventory.findIndex(item => item.itemId === itemId)
        params.UpdateExpression = `SET #I[${index}].quantity = #I[${index}].quantity - :q`
        params.ConditionExpression = `#I[${index}].itemId = :d`
        params.ExpressionAttributeNames = {
            "#I": "inventory"
        }
        params.ExpressionAttributeValues = {
            ":q": quantity,
            ":d": itemId
        }
    } else {
        let index = player.inventory.findIndex(item => item.itemId === itemId)
        params.UpdateExpression = `REMOVE #I[${index}]`
        params.ConditionExpression = `#I[${index}].itemId = :d`
        params.ExpressionAttributeNames = {
            "#I": "inventory"
        }
        params.ExpressionAttributeValues = {
            ":d": itemId
        }
    }

    return ddbDocClientFull.update(params)
        .then((data) => {
            return {
                "status": "success"
            }
        }).catch((error) => {
            if (error.name === "ConditionalCheckFailedException") {
                return Promise.reject({status: 404, msg: "Index mismatch, please try again."})
            } else {
                return Promise.reject({status: 500, msg: "Error removing item."})
            }
        })
}