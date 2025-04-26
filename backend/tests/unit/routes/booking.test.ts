import request from "supertest";
import express, { Express } from "express";
import { describe, it, expect, beforeEach, vi } from "vitest";
import bookingRouter from "../../../src/routes/booking";
import bookingService from "../../../src/services/bookingService";
import type { Booking } from "../../../src/models/types";

describe("POST /booking", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/booking", bookingRouter);
    vi.restoreAllMocks();
  });

  const validUserId = "00000000-0000-0000-0000-000000000001";
  const validCarId = "00000000-0000-0000-0000-000000000002";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(tomorrow.getDate() + 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  it("returns 400 on missing fields", async () => {
    const res = await request(app).post("/booking").send({});
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("returns 400 on invalid UUID or date format", async () => {
    const res = await request(app).post("/booking").send({
      userId: "not-a-uuid",
      carId: "also-not-uuid",
      startDate: "foo",
      endDate: "bar",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("returns 400 when startDate is in the past", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const res = await request(app)
      .post("/booking")
      .send({
        userId: validUserId,
        carId: validCarId,
        startDate: fmt(yesterday),
        endDate: fmt(dayAfter),
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(
      /startDate must be in the future/,
    );
  });

  it("returns 400 when startDate >= endDate", async () => {
    const date = fmt(tomorrow);

    const res = await request(app).post("/booking").send({
      userId: validUserId,
      carId: validCarId,
      startDate: date,
      endDate: date,
    });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(
      /startDate must be before endDate/,
    );
  });

  it("returns 400 on service error", async () => {
    vi.spyOn(bookingService, "createBooking").mockRejectedValue(
      new Error("oops"),
    );

    const res = await request(app)
      .post("/booking")
      .send({
        userId: validUserId,
        carId: validCarId,
        startDate: fmt(tomorrow),
        endDate: fmt(dayAfter),
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe("oops");
  });

  it("returns 201 and booking payload on success", async () => {
    const booking: Booking = {
      id: "b1",
      userId: validUserId,
      carId: validCarId,
      startDate: new Date(tomorrow),
      endDate: new Date(dayAfter),
      totalPrice: 123.45,
    };
    vi.spyOn(bookingService, "createBooking").mockResolvedValue(booking);

    const res = await request(app)
      .post("/booking")
      .send({
        userId: validUserId,
        carId: validCarId,
        startDate: fmt(tomorrow),
        endDate: fmt(dayAfter),
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: booking.id,
      userId: booking.userId,
      carId: booking.carId,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalPrice: booking.totalPrice,
    });
  });
});
