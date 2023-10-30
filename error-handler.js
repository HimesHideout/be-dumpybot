exports.handleErrors = (error, request, response, next) => {
    if (error.status === 404) {
        response.status(error.status).send({ msg: error.msg });
    } else if (error.status === 400) {
        if (error.msg !== undefined){
            response.status(error.status).send({ msg: error.msg });
        } else if (error.__type && error.__type === "com.amazon.coral.validate#ValidationException") {
            response.status(error.status).send({ msg: error.attr_msg});
        }
        else {
            response.status(400).send({msg: "Invalid endpoint parameter(s) format"})
        }
    } else if (error.status === 401) {
        response.status(401).send({ msg: "Unauthorized request" });
    } else {
        console.log(error)
        response.status(500).send({ msg: "Internal server error" });
    }
};