const request = require("supertest");
const app = require("../app");
const getAuthKey = require("../get-auth-token");
const applySchemas = require("../database/apply-schemas");
const seed = require("../seed");

const ENV = process.env.NODE_ENV;
const pathToCorrectFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({path: pathToCorrectFile});

let authToken = ''
beforeAll(async () => {
    await applySchemas()
    await seed(`data/${process.env.NODE_ENV}-player-data.json`, process.env.DYNAMO_PLAYERS_TABLE, "userId")
    await seed(`data/${process.env.NODE_ENV}-item-data.json`, process.env.DYNAMO_ITEMS_TABLE, "itemId")
    authToken = await getAuthKey()
})

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
    test('PUT 200   | Returns 200 and an object with the correct endpoint values in it', () => {
                return request(app)
                    .put("/api/players")
                    .set('Authorization', authToken)
                    .send({userId: "69420"})
                    .expect(200)
                    .then(({body}) => {
                        const player = body.player
                        expect(player.userId).toBe("69420")
                        return request(app)
                            .get(`/api/players/69420`)
                            .expect(200)
                            .then(({body}) => {
                                const player = body.player
                                expect(player).toHaveProperty("userId");
                                expect(player).toHaveProperty("balance");
                                expect(player).toHaveProperty("inventory");
                            })
            })

    });
})

describe('/api/players/:userId', () => {
    test('GET 200   | Returns 200 and an object with the correct endpoint values on it', () => {
        return request(app)
            .get("/api/players/1")
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
            .get("/api/players/1")
            .expect(200)
            .then(({body}) => {
                const player = body.player
                expect(player).toHaveProperty("userId");
                expect(player.userId).toBe("1")
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
            .get("/api/players/4")
            .expect(404)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("Player not found")
            })
    });
    test('PATCH 200 | Returns 200 and an object with the correct values on it', () => {
        let afterPatch
        return request(app)
            .patch("/api/players/1")
            .set('Authorization', authToken)
            .send({incr_balance: 1})
            .expect(200)
            .then(({body}) => {
                const player = body.player
                afterPatch = player.balance
                expect(afterPatch).toBe(1)
            })
    });

    test('PATCH 400 | Returns 400 when attempting to reduce balance to under 0, and provides a message', () => {
        return request(app)
            .patch("/api/players/2")
            .set('Authorization', authToken)
            .send({incr_balance: -100000000000})
            .expect(400)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("insufficient balance for action")
            })

    });

    test('PATCH 401 | Returns 401 when attempting an unauthenticated request', () => {
        return request(app)
            .patch("/api/players/1")
            .send({incr_balance: 1})
            .expect(401)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("Unauthorized request")
            })
    });

    test('PATCH 404 | Returns 404 when requesting a player that doesn\'t exist', () => {
        return request(app)
            .patch("/api/players/4")
            .set('Authorization', authToken)
            .send({incr_balance: 1})
            .expect(404)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("Player not found")
            })
    });

    test('DELETE 204    | Returns 204 when successfully deleting a preexisting player ', () => {
        return request(app)
            .delete("/api/players/1")
            .set("Authorization", authToken)
            .expect(204)
            .then(() => {
                return request(app)
                    .get("/api/players/1")
                    .expect(404)
            })
    });

    test('DELETE 404    | Returns 404 when deleting a player that doesnt exist', () => {
        return request(app)
            .delete("/api/players/4")
            .set("Authorization", authToken)
            .expect(404)
    });

});

describe("/api/items", () => {
    test('GET 200   | Returns 200 and an object with the correct endpoint values in it', () => {
        return request(app)
            .get("/api/items")
            .expect(200)
            .then(({body}) => {
                const items = body.items
                items.forEach(item => {
                    expect(item).toHaveProperty("itemId");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("cost");
                    expect(item).toHaveProperty("isStackable");
                })
            })
    });
    test('PUT 200   | Returns 200 and an object with the correct endpoint values in it', () => {
        return request(app)
            .put("/api/items")
            .set("Authorization", authToken)
            .send({
                itemId: "69420",
                name: "TestItem", 
                description: "Some test item",
                cost: 100,
            })
            .expect(200)
            .then(({body}) => {
                const item = body.item
                expect(item).toHaveProperty("itemId");
                return request(app)
                    .get("/api/items/69420")
                    .expect(200)
                    .then(({body}) => {
                        const item = body.item
                        expect(item).toHaveProperty("itemId");
                        expect(item).toHaveProperty("name");
                        expect(item).toHaveProperty("description");
                        expect(item).toHaveProperty("cost");
                        expect(item).toHaveProperty("isStackable");
                    })
            })
    });
})

describe("/api/items/:itemId", () => {
    test('GET 200   | Returns 200 and an object with the correct endpoint values on it', () => {
        return request(app)
            .get("/api/items/1")
            .expect(200)
            .then(({body}) => {
                const item = body.item
                expect(Object.keys(item).length > 0).toBe(true);
                expect(item).toHaveProperty("itemId");
                expect(item).toHaveProperty("name");
                expect(item).toHaveProperty("description");
                expect(item).toHaveProperty("cost");
                expect(item).toHaveProperty("isStackable");
            })
    });
    test('GET 200   | Returns 200 and an item object with the correct itemId', () => {
        return request(app)
            .get("/api/items/1")
            .expect(200)
            .then(({body}) => {
                const item = body.item
                expect(item).toHaveProperty("itemId");
                expect(item.itemId).toBe("1")
            })
    });
    test('GET 404   | Returns 404 when passed a valid but nonexistent itemId', () => {
        return request(app)
            .get("/api/items/4")
            .expect(404)
            .then(({body}) => {
                expect(body).toHaveProperty("msg");
                expect(body.msg).toBe("Item not found")
            })
    });
    test('DELETE 204    | Returns 204 when successfully deleting a preexisting item ', () => {
        return request(app)
            .delete("/api/items/1")
            .set("Authorization", authToken)
            .expect(204)
            .then(() => {
                return request(app)
                    .get("/api/items/1")
                    .expect(404)
            })
    });
    test('DELETE 404    | Returns 404 when deleting a item that doesnt exist', () => {
        return request(app)
            .delete("/api/items/4")
            .set("Authorization", authToken)
            .expect(404)
    });
})