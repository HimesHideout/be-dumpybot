const {ddbDocClientFull} = require("../database/connection");

exports.selectPlayers = () => {

    const scanParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`
    }

    return ddbDocClientFull
        .scan(scanParams)
        .then((data) => {
            return data.Items
        })
}

exports.selectPlayerById = (playerId) => {
    const getParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`,
        Key: {
            userId: playerId
        }
    }
    return ddbDocClientFull
        .get(getParams)
        .then((data) => {
            if (data.Item === undefined) {
                return Promise.reject({status: 404, msg: "Player not found"});
            } else {
                return data.Item
            }
        })
}

exports.insertPlayer = (playerId) => {
    if (playerId === undefined || playerId === ""){
        return Promise.reject({ status: 400, msg: "userId is required" });
    }
    const putParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`,
        Item: {
            userId: playerId,
            balance: 0,
            inventory: {}
        }
    }

    return ddbDocClientFull
        .put(putParams)
        .then((data) => {
            if (data.$metadata.httpStatusCode === 200) {
                const getParams = {
                    TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`,
                    Key: {
                        userId: playerId
                    }
                }
                return ddbDocClientFull
                    .get(getParams)
                    .then((data) => data.Item)
            } else {
                return Promise.reject({status: data.$metadata.httpStatusCode, msg: "Error creating player."})
            }
        })
}

exports.updatePlayerById = async (playerId, patch) => {

    const data = await ddbDocClientFull.get({TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`, Key: {userId: playerId}})
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
            TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`,
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
    // if (playerId === undefined || playerId === ""){
    //     return Promise.reject({ status: 400, msg: "userId is required" });
    // }
    const deleteParams = {
        TableName: `${process.env.DYNAMO_TABLE_PREFIX}-players`,
        Key: {
            userId: playerId
        }
    }

    return ddbDocClientFull
        .delete(deleteParams)
        .then((data) => {
            return data
        })
}