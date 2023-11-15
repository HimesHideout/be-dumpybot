const axios = require("axios");

const ENV = process.env.NODE_ENV || "development";
const pathToCorrectFile = `${__dirname}/.env.${ENV}`;
require("dotenv").config({ path: pathToCorrectFile });

const getAuthKey = async () => {

    const options = {
        url: process.env.AUTH_URL,
        body: {
            "audience": process.env.AUTH_AUDIENCE,
            "client_id": process.env.AUTH_CLIENT_ID,
            "client_secret": process.env.AUTH_CLIENT_SECRET,
            "grant_type": "client_credentials"
        }
    };
    const authObj = await axios.post(options.url, options.body)
    const data = authObj.data
    const output = `${data.token_type} ${data.access_token}`
    console.log(output)
    return output
}

getAuthKey().then(null)

module.exports = getAuthKey