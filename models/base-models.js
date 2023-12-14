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