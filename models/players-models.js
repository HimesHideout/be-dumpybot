const {ddbDocClientFull} = require("../database/connection");
const {selectAll, selectById, removeById, insert} = require("./base-models");

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
        inventory: {}
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