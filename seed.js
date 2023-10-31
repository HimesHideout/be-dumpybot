const {ddbDocClientFull} = require(`${__dirname}/database/connection`);
const fs = require("fs");

const seed = async () => {

    const scanParams = {
        TableName: "test-players",
        ProjectionExpression: "userId"
    }

    const readData = await ddbDocClientFull.scan(scanParams)
    const existingData = readData.Items
    const deleteRequests = existingData.map(player => ({DeleteRequest: {Key: player}}));
    const deleteParams = { RequestItems: { "test-players": deleteRequests } }
    await ddbDocClientFull.batchWrite(deleteParams)

    const rawData = fs.readFileSync("data/test-player-data.json", "utf-8")
    const jsonData = JSON.parse(rawData)
    const putRequests = jsonData.map((player) => ({
        PutRequest: {
            Item: player,
        },
    }));

    const params = {
        RequestItems: {
            "test-players": putRequests,
        },
    }

    const seededData = await ddbDocClientFull.batchWrite(params);
    console.log("Batch Written:\n", seededData)
}

seed()