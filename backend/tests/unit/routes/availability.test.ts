import request from "supertest";
import express from "express";
import { describe, it, expect, beforeEach, vi } from "vitest";
import availabilityRouter from "../../../src/routes/availability";
import availabilityService from "../../../src/services/availabilityService";
import { AvailableCar } from "../../../src/models/types";

describe("GET /availability", () => {
  let app = express();

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/availability", availabilityRouter);
    vi.restoreAllMocks();
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const CAR1_ID = "00000000-0000-0000-0000-000000000001";
  const CAR2_ID = "00000000-0000-0000-0000-000000000002";

  it("returns full list when valid", async () => {
    const cars: AvailableCar[] = [
      {
        id: CAR1_ID,
        brand: "A",
        model: "B",
        pricing: [],
        imageURL: "",
        totalPrice: 0,
        averageDailyPrice: 0,
      },
    ];
    vi.spyOn(availabilityService, "listAvailable").mockResolvedValue(cars);

    const res = await request(app)
      .get("/availability")
      .query({ startDate: fmt(tomorrow), endDate: fmt(dayAfter) });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(cars);
  });

  it("filters by carId when provided", async () => {
    const c1: AvailableCar = {
      id: CAR1_ID,
      brand: "A",
      model: "B",
      pricing: [],
      imageURL: "",
      totalPrice: 0,
      averageDailyPrice: 0,
    };
    const c2: AvailableCar = {
      id: CAR2_ID,
      brand: "X",
      model: "Y",
      pricing: [],
      imageURL: "",
      totalPrice: 0,
      averageDailyPrice: 0,
    };
    vi.spyOn(availabilityService, "listAvailable").mockResolvedValue([c1, c2]);

    const res = await request(app)
      .get("/availability")
      .query({
        startDate: fmt(tomorrow),
        endDate: fmt(dayAfter),
        carId: CAR2_ID,
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([c2]);
  });

  it("returns 404 if carId not in list", async () => {
    const c1: AvailableCar = {
      id: CAR1_ID,
      brand: "A",
      model: "B",
      pricing: [],
      imageURL: "",
      totalPrice: 0,
      averageDailyPrice: 0,
    };
    vi.spyOn(availabilityService, "listAvailable").mockResolvedValue([c1]);

    const res = await request(app)
      .get("/availability")
      .query({
        startDate: fmt(tomorrow),
        endDate: fmt(dayAfter),
        carId: CAR2_ID, // this isn't in the returned list
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Car not available" });
  });

  it("handles unexpected errors as 400", async () => {
    vi.spyOn(availabilityService, "listAvailable").mockRejectedValue(
      new Error("boom"),
    );

    const res = await request(app)
      .get("/availability")
      .query({ startDate: fmt(tomorrow), endDate: fmt(dayAfter) });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe("boom");
  });
});
