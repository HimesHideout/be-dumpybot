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

async function applySchemas() {
    const tables = (await DB.listTables({})).TableNames
    let tables_created = 0
    try {
        for (const schema of schemas) {
            const schemaData = require(`${__dirname}/schemas/${schema}`)
            const schemaTableName = `${process.env.DYNAMO_TABLE_PREFIX}-${schemaData.TableName}`
            schemaData.TableName = schemaTableName
            if (tables.includes(schemaTableName)) {
                if (CLI_ARGS.includes("--force")) {
                    console.log(`Table ${schemaTableName} already exists. Deleting...`)
                    //TODO: Make the script wait until the table has actually been deleted before creating it again.
                    await DB.deleteTable({
                        TableName: schemaTableName
                    })
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
