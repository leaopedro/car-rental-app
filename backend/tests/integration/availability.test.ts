/// <reference types="vitest/globals" />
import request from "supertest";
import app from "../../src/app";
import dbClient from "../../src/db";
import { initialCars } from "../../src/data/initialCars";

describe("GET /availability (integration)", () => {
  beforeAll(async () => {
    await dbClient.init?.();
  });

  beforeEach(async () => {
    await dbClient.init();
  });

  it("returns full list when no bookings exist", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const res = await request(app)
      .get("/availability")
      .query({
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
      })
      .expect(200);

    expect(res.body).toHaveLength(initialCars.length);
  });

  it("excludes a car once it has been booked", async () => {
    const user = await request(app)
      .post("/users")
      .send({
        email: "test@x.com",
        drivingLicenseValidUntil: "2030-01-01",
      })
      .expect(201);

    const { id: carId } = initialCars[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    await request(app)
      .post("/booking")
      .send({
        userId: user.body.id,
        carId,
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
      })
      .expect(201);

    const res2 = await request(app)
      .get("/availability")
      .query({
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
      })
      .expect(200);

    expect(res2.body.find((c: any) => c.id === carId)).toBeFalsy();
    expect(res2.body).toHaveLength(initialCars.length - 1);
  });

  it("returns only the requested car when carId is provided", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const pick = initialCars[1].id;
    const res = await request(app)
      .get("/availability")
      .query({
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
        carId: pick,
      })
      .expect(200);

    expect(res.body).toEqual([expect.objectContaining({ id: pick })]);
  });

  it("404s if you ask for a carId that isn’t available", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    await request(app)
      .get("/availability")
      .query({
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: dayAfter.toISOString().split("T")[0],
        carId: "00000000-0000-0000-0000-000000000000",
      })
      .expect(404, { message: "Car not available" });
  });
});
