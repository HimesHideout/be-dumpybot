const request = require("supertest");
const app = require("../app");

const ENV = "development";
const pathToCorrectFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({ path: pathToCorrectFile });

describe("/api", () => {
    test("GET 200   | Returns 200 and an object with correct endpoint values within", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                expect(Object.keys(body).length > 0).toBe(true);
                for (const key in body) {
                    expect(body[key]).toHaveProperty("description");
                    expect(body[key]).toHaveProperty("queries");
                    expect(body[key]).toHaveProperty("bodyFormat");
                    expect(body[key]).toHaveProperty("exampleResponse");
                }
            });
    });
    test("GET 200   | Returns instructions for all available endpoints", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                const endpointsInRes = [];
                const endpointsInApp = app._router.stack
                    .filter((layer) => layer.route)
                    .map((r) => r.route.path);
                for (const key in body) {
                    endpointsInRes.push(key.substring(key.indexOf("/")));
                }
                expect(endpointsInRes).toIncludeSameMembers(endpointsInApp);
            });
    });
    test("GET 404   | Returns an appropriate message when passed an invalid endpoint url", () => {
        return request(app)
            .get("/api/cute_cats")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("url not found");
            });
    });
});

/*
describe("/api/players", () => {
    test('GET 200   | Returns 200 and an object with the correct endpoint values in it', () => {
        return request(app)
            .get("/api/players")
            .expect(200)
            .then(({body}) => {
                body.forEach((business) => {
                    expect(business).toHaveProperty("userId");
                    expect(business).toHaveProperty("balance");
                    expect(business).toHaveProperty("inventory");
                });
            })
    });
})*/
