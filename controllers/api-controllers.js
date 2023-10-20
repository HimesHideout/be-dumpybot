const fs = require("fs/promises");

exports.getEndpoints = (require, response, next) => {
    return fs.readFile('data/endpoints.json', "utf-8")
        .then(fileRead => {
            return JSON.parse(fileRead)
        }).then((apis) => {
            response.status(200).send(apis)
        }).catch(err => next(err))
}