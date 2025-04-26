import { describe, it, expect, beforeEach, vi } from "vitest";
import CarModel from "../../../src/models/carModel";
import db from "../../../src/db";
import type { Car } from "../../../src/models/types";

describe("CarModel", () => {
  const CAR1: Car = {
    id: "car-1",
    brand: "BrandA",
    model: "ModelA",
    pricing: [
      { season: "peak", pricePerDay: 100 },
      { season: "mid", pricePerDay: 50 },
      { season: "off", pricePerDay: 20 },
    ],
    imageURL: "url1",
  };
  const CAR2: Car = {
    id: "car-2",
    brand: "BrandB",
    model: "ModelB",
    pricing: [
      // missing mid-season
      { season: "peak", pricePerDay: 200 },
      { season: "off", pricePerDay: 30 },
    ],
    imageURL: "url2",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("findAll", () => {
    it("forwards to db.getAllCars", async () => {
      vi.spyOn(db, "getAllCars").mockResolvedValue([CAR1]);
      const result = await CarModel.findAll();
      expect(db.getAllCars).toHaveBeenCalled();
      expect(result).toEqual([CAR1]);
    });
  });

  describe("listAvailable", () => {
    const mkDate = (s: string) => new Date(s);
    const JUL1 = mkDate("2025-07-01");
    const JUL3 = mkDate("2025-07-03");

    it("returns empty when no cars", async () => {
      vi.spyOn(db, "getAllCars").mockResolvedValue([]);
      const result = await CarModel.listAvailable(JUL1, JUL3);
      expect(result).toEqual([]);
    });

    it("filters out cars with existing bookings", async () => {
      vi.spyOn(db, "getAllCars").mockResolvedValue([CAR1]);
      vi.spyOn(db, "findBookingsByCarAndDateRange").mockResolvedValueOnce([
        {},
      ] as any); // conflict
      const result = await CarModel.listAvailable(JUL1, JUL3);
      expect(result).toEqual([]);
    });

    it("calculates totalPrice & averageDailyPrice correctly", async () => {
      vi.spyOn(db, "getAllCars").mockResolvedValue([CAR1]);
      vi.spyOn(db, "findBookingsByCarAndDateRange").mockResolvedValue([]);

      const result = await CarModel.listAvailable(JUL1, JUL3);

      expect(result).toHaveLength(1);
      const car = result[0];
      expect(car.id).toBe(CAR1.id);
      expect(car.totalPrice).toBe(200);
      expect(car.averageDailyPrice).toBe(100);
    });

    it("uses zero price when season missing", async () => {
      // CAR2 has no 'mid' price
      const APR1 = mkDate("2025-04-01");
      const APR3 = mkDate("2025-04-03");

      vi.spyOn(db, "getAllCars").mockResolvedValue([CAR2]);
      vi.spyOn(db, "findBookingsByCarAndDateRange").mockResolvedValue([]);

      const result = await CarModel.listAvailable(APR1, APR3);
      expect(result).toHaveLength(1);
      const car = result[0];

      expect(car.totalPrice).toBe(0);
      expect(car.averageDailyPrice).toBe(0);
    });
  });
});
