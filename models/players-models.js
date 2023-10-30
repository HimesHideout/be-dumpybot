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
            // console.log(data.Items)
            return data.Items
        })
}