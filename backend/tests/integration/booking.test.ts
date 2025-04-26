import request from "supertest";
import app from "../../src/app";
import dbClient from "../../src/db";
import { initialCars } from "../../src/data/initialCars";

describe("POST /booking (integration)", () => {
  beforeAll(async () => {
    await dbClient.init?.();
  });

  beforeEach(async () => {
    await dbClient.init();
  });

  it("400s on missing or invalid payload", async () => {
    await request(app).post("/booking").send({}).expect(400);
    await request(app)
      .post("/booking")
      .send({
        userId: "not-a-uuid",
        carId: "also-not-uuid",
        startDate: "bad-date",
        endDate: "bad-date",
      })
      .expect(400);
  });

  it("400s if startDate is in the past or startDate ≥ endDate", async () => {
    const today = new Date().toISOString().split("T")[0];
    await request(app)
      .post("/booking")
      .send({
        userId: "11111111-1111-1111-1111-111111111111",
        carId: initialCars[0].id,
        startDate: "2000-01-01",
        endDate: "2000-01-02",
      })
      .expect(400);

    await request(app)
      .post("/booking")
      .send({
        userId: "11111111-1111-1111-1111-111111111111",
        carId: initialCars[0].id,
        startDate: today,
        endDate: today,
      })
      .expect(400);
  });

  it("400s if service throws (e.g. non‐existent user)", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    await request(app)
      .post("/booking")
      .send({
        userId: "22222222-2222-2222-2222-222222222222",
        carId: initialCars[0].id,
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toEqual({ errors: [{ message: "User not found" }] });
      });
  });

  it("201s and returns booking payload on success", async () => {
    const userRes = await request(app)
      .post("/users")
      .send({
        email: "int@booking.com",
        drivingLicenseValidUntil: "2030-12-31",
      })
      .expect(201);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const res = await request(app)
      .post("/booking")
      .send({
        userId: userRes.body.id,
        carId: initialCars[0].id,
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
      })
      .expect(201);

    expect(res.body).toMatchObject({
      userId: userRes.body.id,
      carId: initialCars[0].id,
      totalPrice: expect.any(Number),
      startDate: tomorrow.toISOString().split("T")[0] + "T00:00:00.000Z",
      endDate: dayAfter.toISOString().split("T")[0] + "T00:00:00.000Z",
    });
  });
});
