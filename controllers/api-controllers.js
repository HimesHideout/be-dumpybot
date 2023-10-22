const fs = require("fs/promises");

exports.getEndpoints = (request, response, next) => {
    return fs.readFile('data/endpoints.json', "utf-8")
        .then(fileRead => {
            return JSON.parse(fileRead)
        }).then((apis) => {
            response.status(200).send(apis)
        }).catch(err => next(err))
}

exports.getSecret = (request, response, next) => {
    return fs.readFile('data/private.json', "utf-8")
        .then(fileRead => {
            return JSON.parse(fileRead)
        }).then((secret) => {
            response.status(200).send(secret)
        }).catch(err => {
            next(err)
        })
}