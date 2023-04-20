import { Fruit } from "repositories/fruits-repository";
import fruits from "../../src/data/fruits";
import httpStatus from "http-status";
import supertest from "supertest";
import app from "../../src/index";

const api = supertest(app);

const testFruit: Fruit = { id: 1, name: "banana", price: 10 };

describe("GET /fruits", () => {
  beforeAll(() => fruits.push(testFruit));
  afterAll(() => (fruits.length = 0));

  it("Should respond with status 200 and an array of fruits", async () => {
    const result = await api.get("/fruits");

    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual(expect.arrayContaining<Fruit>([]));
  });
});

describe("GET /fruits/:id", () => {
  beforeAll(() => fruits.push(testFruit));
  afterAll(() => (fruits.length = 0));

  it("Should respond with status 200 and a fruit", async () => {
    const result = await api.get(`/fruits/${testFruit.id}`);

    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toMatchObject(testFruit);
  });

  it("Should respond with status 404 if fruit id is not found", async () => {
    const result = await api.get("/fruits/0");

    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });
});

describe("POST /fruits", () => {
  afterAll(() => (fruits.length = 0));

  const fruitPayload = { ...testFruit };
  delete fruitPayload.id;

  it("Should respond with status 201 and create a fruit", async () => {
    const result = await api.post("/fruits").send(fruitPayload);

    expect(result.status).toBe(httpStatus.CREATED);
  });

  it("Should respond with status 422 if payload is invalid", async () => {
    const result = await api
      .post("/fruits")
      .send({ invalidPayload: "invalid" });

    expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });

  it("Should respond with status 409 if fruit name is already in use", async () => {
    fruitPayload.name = "maca";

    await api.post("/fruits").send(fruitPayload);
    const result = await api.post("/fruits").send(fruitPayload);

    expect(result.status).toBe(httpStatus.CONFLICT);
  });
});
