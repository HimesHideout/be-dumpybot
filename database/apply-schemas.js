const { DynamoDB } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb")
const fs = require('node:fs');
const path = require('node:path');

const ENV = process.env.NODE_ENV
const CLI_ARGS = process.argv.slice(2)
const pathToCorrectFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({ path: pathToCorrectFile });
const DB = new DynamoDB({region: process.env.AWS_DEFAULT_REGION})
const schemas = fs.readdirSync(`${__dirname}/schemas`).filter(file => file.endsWith('.json'));
const tableNames = {
    "players": process.env.DYNAMO_PLAYERS_TABLE,
    "items": process.env.DYNAMO_ITEMS_TABLE
}

async function applySchemas() {
    const tables = (await DB.listTables({})).TableNames
    let tables_created = 0
    try {
        for (const schema of schemas) {
            const schemaData = require(`${__dirname}/schemas/${schema}`)
            const schemaTableName = tableNames[schemaData.TableName]
            schemaData.TableName = schemaTableName
            if (tables.includes(schemaTableName)) {
                if (CLI_ARGS.includes("--force")) {
                    console.log(`Table ${schemaTableName} already exists. Deleting...`)
                    await DB.deleteTable({
                        TableName: schemaTableName
                    })
                    //Check and wait for table to be deleted.
                    let deleted = false
                    while (!deleted) {
                        try {
                            const tableStatus = (await DB.describeTable({
                                TableName: schemaTableName
                            })).Table.TableStatus
                            if (tableStatus === "DELETING") {
                                console.log(`Waiting for table ${schemaTableName} to be deleted...`)
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            } else {
                                deleted = true
                            }
                        } catch (error) {
                            if (error.name === "ResourceNotFoundException") {
                                deleted = true
                            } else {
                                throw error
                            }
                        }
                    }
                    console.log(`Table ${schemaTableName} deleted.`)
                } else {
                    console.log(`Table ${schemaTableName} already exists. Skipping...`)
                    continue
                }
            }
            console.log(`Table ${schemaTableName} does not exist. Creating...`)
            const response = await DB.createTable(schemaData)
            tables_created++
            console.log(`Table ${schemaTableName} created.`)
        }
    } catch (error) {
        console.error(error)
    }
    console.log(`Schema completed. ${tables_created} tables created.`)
}

if (require.main === module) {
    applySchemas().then(null)
}

module.exports = applySchemas
