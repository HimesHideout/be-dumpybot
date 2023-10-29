const { DynamoDB } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb")
const fs = require('node:fs');
const path = require('node:path');

const ENV = process.env.NODE_ENV
const CLI_ARGS = process.argv.slice(2)
const pathToCorrectFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({ path: pathToCorrectFile });
console.log(process.env.AWS_REGION)
const DB = new DynamoDB()
const schemas = fs.readdirSync(`${__dirname}/schemas`).filter(file => file.endsWith('.json'));

async function migrate() {
    const tables = (await DB.listTables({})).TableNames
    let tables_created = 0
    try {
        for (const schema of schemas) {
            const schemaData = require(`${__dirname}/schemas/${schema}`)
            if (tables.includes(schemaData.TableName)) {
                if (CLI_ARGS.includes("--force")) {
                    console.log(`Table ${schemaData.TableName} already exists. Deleting...`)
                    //TODO: Make the script wait until the table has actually been deleted before creating it again.
                    await DB.deleteTable({
                        TableName: schemaData.TableName
                    })
                } else {
                    console.log(`Table ${schemaData.TableName} already exists. Skipping...`)
                    continue
                }
            }
            console.log(`Table ${schemaData.TableName} does not exist. Creating...`)
            const response = await DB.createTable(schemaData)
            tables_created++
            console.log(`Table ${schemaData.TableName} created.`)
        }
    } catch (error) {
        console.error(error)
    }
    console.log(`schema completed. ${tables_created} tables created.`)
}

migrate()
