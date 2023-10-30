// const {ScanCommand} = require("@aws-sdk/lib-dynamodb")
/*    const command = new ScanCommand({
        TableName: "test-players",
    });*/

const {ddbDocClientFull} = require("../database/connection");

exports.selectPlayers = () => {

    const scanParams = {
        TableName: "test-players"
    }

    return ddbDocClientFull
        .scan(scanParams)
        .then((data) => {
            return data.Items
        })
}

exports.selectPlayerById = (playerId) => {
    const getParams = {
        TableName: "test-players",
        Key: {
            userId: playerId
        }
    }

    return ddbDocClientFull
        .get(getParams)
        .then((data) => {
            console.log(data)
            if (data.Item === undefined){
                return Promise.reject({ status: 404, msg: "Player not found" });
            } else {
                return data.Item
            }
        })
}