const request = require("request");

const options = {
    method: 'POST',
    url: 'https://dev-btw4il1186pitwdx.us.auth0.com/oauth/token',
    headers: {'content-type': 'application/json'},
    body: '{"client_id":"zAgF9v5z99qdpAIeRzdlX7YSMOkyCiSE","client_secret":"R22bi2RgcH80bZwdY1WMipfcGlxFbYu8QOZnpNwq4kyiI0iIbIQ9ftkNKI-tkBAQ","audience":"http://localhost:9090","grant_type":"client_credentials"}'
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const authObj = JSON.parse(body)
    console.log(`${authObj.token_type} ${authObj.access_token}`)
});