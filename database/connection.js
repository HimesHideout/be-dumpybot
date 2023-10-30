const {DynamoDBClient, DynamoDB} = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocumentClient, DynamoDBDocument} = require("@aws-sdk/lib-dynamodb");

const ENV = process.env.NODE_ENV || 'development';
const pathToCorrectFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({path: pathToCorrectFile});

const client = new DynamoDBClient({region: process.env.AWS_DEFAULT_REGION});
const ddbDocClient = DynamoDBDocumentClient.from(client)

// noinspection JSClosureCompilerSyntax
const clientFull = new DynamoDB({region: process.env.AWS_DEFAULT_REGION});
const ddbDocClientFull = DynamoDBDocument.from(clientFull)

module.exports = {ddbDocClient, ddbDocClientFull}