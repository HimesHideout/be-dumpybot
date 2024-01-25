const {ddbDocClientFull} = require("../database/connection");

exports.selectAll = (table) => {

    const scanParams = {
        TableName: table
    }

    return ddbDocClientFull
        .scan(scanParams)
        .then((data) => {
            return data.Items
        })
}

exports.selectById = (table, key, value) => {
    const getParams = {
        TableName: table,
        Key: {
            [key]: value
        }
    }

    return ddbDocClientFull
        .get(getParams)
        .then((data) => {
            if (data.Item === undefined) {
                return Promise.reject({status: 404, msg: `${key} not found`});
            } else {
                return data.Item
            }
        })
}

exports.selectByAttribute = (table, attribute, value) => {
    const scanParams = {
        TableName: table,
        FilterExpression: `${attribute} = :value`,
        ExpressionAttributeValues: {
            ":value": value
        }
    }

    return ddbDocClientFull
        .scan(scanParams)
        .then((data) => {
            return data.Items
        })
}

exports.selectByAttributes = (table, attributes, values) => {
    const scanParams = {
        TableName: table,
        FilterExpression: attributes.map((attribute, index) => `${attribute} = :value${index}`).join(" AND "),
        ExpressionAttributeValues: values.reduce((accumulator, value, index) => {
            return {
                ...accumulator,
                [`:value${index}`]: value
            }
        }, {})
    }

    return ddbDocClientFull
        .scan(scanParams)
        .then((data) => {
            return data.Items
        })
}

exports.insert = (table, itemParams, key, value) => {
    const putParams = {
        TableName: table,
        Item: itemParams
    }

    return ddbDocClientFull
        .put(putParams)
        .then((data) => {
            if (data.$metadata.httpStatusCode === 200) {
                const getParams = {
                    TableName: table,
                    Key: {
                        [key]: value
                    }
                }
                return ddbDocClientFull
                    .get(getParams)
                    .then((data) => data.Item)
            } else {
                return Promise.reject({status: data.$metadata.httpStatusCode, msg: "Insertion error"});
            }
        })
}

exports.removeById = (table, key, value) => {
    const deleteParams = {
        TableName: table,
        Key: {
            [key]: value
        }
    }

    return ddbDocClientFull
        .delete(deleteParams)
        .then((data) => {
            return data
        })
}