const axios = require("axios");

const getAuthKey = async () => {

    const options = {
        url: 'https://dev-btw4il1186pitwdx.us.auth0.com/oauth/token',
        body: {
            "audience": "http://localhost:9090",
            "client_id": "zAgF9v5z99qdpAIeRzdlX7YSMOkyCiSE",
            "client_secret": "R22bi2RgcH80bZwdY1WMipfcGlxFbYu8QOZnpNwq4kyiI0iIbIQ9ftkNKI-tkBAQ",
            "grant_type": "client_credentials"
        }
    };

    const authObj = await axios.post(options.url, options.body)
    const data = authObj.data
    const output = `${data.token_type} ${data.access_token}`
    console.log(output)
    return output
}

getAuthKey()

module.exports = getAuthKey