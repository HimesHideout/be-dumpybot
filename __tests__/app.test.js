const request = require("supertest");
const app = require("../app");

const ENV = process.env.NODE_ENV;
const pathToCorrectFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({path: pathToCorrectFile});

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

describe("/api/players", () => {
    test('GET 200   | Returns 200 and an object with the correct endpoint values in it', () => {
        return request(app)
            .get("/api/players")
            .expect(200)
            .then(({body}) => {
                const players = body.players
                players.forEach((business) => {
                    expect(business).toHaveProperty("userId");
                    expect(business).toHaveProperty("balance");
                    expect(business).toHaveProperty("inventory");
                });
            })
    });
})

describe('/api/players/:userId', () => {
    test('GET 200   | Returns 200 and an object with the correct endpoint values on it', () => {
        return request(app)
            .get("/api/players/168129756255092737")
            .expect(200)
            .then(({body}) => {
                const player = body.player
                expect(Object.keys(player).length > 0).toBe(true);
                expect(player).toHaveProperty("balance");
                expect(player).toHaveProperty("userId");
                expect(player).toHaveProperty("inventory");
            })
    });
    test('GET 200   | Returns 200 and a player object with the correct userId', () => {
        return request(app)
            .get("/api/players/168129756255092737")
            .expect(200)
            .then(({body}) => {
                const player = body.player
                expect(player).toHaveProperty("userId");
                expect(player.userId).toBe("168129756255092737")
            })
    });
    test('GET 400   | Returns 400 when passed an invalid userId format (contains letters) with appropriate error message', () => {
        return request(app)
            .get("/api/players/myuserId")
            .expect(400)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("Invalid userId format")
            })
    });
    test('GET 404   | Returns 404 when passed a valid but nonexistent userId', () => {
        return request(app)
            .get("/api/players/18364892302783782")
            .expect(404)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("Player not found")
            })
    });
});
