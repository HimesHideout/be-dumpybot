exports.handleServerError = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "Internal server error" });
};

exports.handle404s = (error, request, response, next) => {
    if (error.status === 404) {
        response.status(error.status).send({ msg: error.msg });
    }
};