const {ddbDocClientFull} = require(`${__dirname}/database/connection`);
const fs = require("fs");

const seed = async (seedDataPath) => {

    const ENV = process.env.NODE_ENV
    const pathToCorrectFile = `${__dirname}/.env.${ENV}`;
    require("dotenv").config({ path: pathToCorrectFile });

    const tableName = process.env.DYNAMO_TABLE_NAME

    const scanParams = {
        TableName: tableName,
        ProjectionExpression: "userId"
    }

    const readData = await ddbDocClientFull.scan(scanParams)
    const existingData = readData.Items

    if (existingData.length > 0) {
        const deleteRequests = existingData.map(player => ({DeleteRequest: {Key: player}}));
        const deleteParams = {
            RequestItems: {
                [tableName]: deleteRequests
            }
        }
        await ddbDocClientFull.batchWrite(deleteParams)
    }


    const rawData = fs.readFileSync(seedDataPath, "utf-8")
    const jsonData = JSON.parse(rawData)
    const putRequests = jsonData.map((player) => ({
        PutRequest: {
            Item: player,
        },
    }));

    const params = {
        RequestItems: {
            [tableName]: putRequests,
        },
    }

    const seededData = await ddbDocClientFull.batchWrite(params);
    console.log("Batch Written:\n", seededData["$metadata"].requestId)
}

seed(`data/${process.env.NODE_ENV}-player-data.json`).then(() => {
    console.log("Seeded Data!")
})

module.exports = seed