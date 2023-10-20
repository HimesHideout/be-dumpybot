const app = require("./app");

const start = async () => {
    try {
        app.listen(9090, () => console.log("Server started on port 9090"));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();