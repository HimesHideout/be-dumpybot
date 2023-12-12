const {ddbDocClientFull} = require(`${__dirname}/database/connection`);
const fs = require("fs");

const seed = async (seedDataPath, tableName, idField) => {
    
    const ENV = process.env.NODE_ENV
    const pathToCorrectFile = `${__dirname}/.env.${ENV}`;
    require("dotenv").config({ path: pathToCorrectFile });
        
    const scanParams = {
        TableName: tableName,
        ProjectionExpression: idField
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
    const putRequests = jsonData.map((item) => ({
        PutRequest: {
            Item: item,
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

if (require.main === module) {
    seed(`data/${process.env.NODE_ENV}-player-data.json`, process.env.DYNAMO_PLAYERS_TABLE, "userId").then(() => {
        console.log("Seeded Player Data!")
    })
    seed(`data/${process.env.NODE_ENV}-item-data.json`, process.env.DYNAMO_ITEMS_TABLE, "itemId").then(() => {
        console.log("Seeded Item Data!")
    })
}

module.exports = seed