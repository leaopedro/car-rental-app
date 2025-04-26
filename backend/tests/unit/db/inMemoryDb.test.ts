import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Car, Booking, CreateUserDTO } from "../../../src/models/types";

let inMemoryDb: typeof import("../../../src/db/inMemoryDb").inMemoryDb;
let initialCars: Car[];

beforeEach(async () => {
  vi.resetModules();
  const dbModule = await import("../../../src/db/inMemoryDb");
  inMemoryDb = dbModule.inMemoryDb;
  initialCars = (await import("../../../src/data/initialCars")).initialCars;
  await inMemoryDb.init();
});

describe("inMemoryDb", () => {
  describe("init and getAllCars", () => {
    it("seeds cars correctly", async () => {
      const cars = await inMemoryDb.getAllCars();
      expect(cars).toEqual(initialCars);
      expect(cars).not.toBe(initialCars);
    });
  });

  describe("Bookings by user/car and date range", () => {
    const userId = "u1";
    const carId = "c1";
    const baseBooking: Omit<Booking, "id"> = {
      userId,
      carId,
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-01-12"),
      totalPrice: 100,
    };

    it("returns empty arrays when no bookings exist", async () => {
      expect(
        await inMemoryDb.findBookingsByUserAndDateRange(
          userId,
          new Date("2025-01-01"),
          new Date("2025-02-01"),
        ),
      ).toEqual([]);
      expect(
        await inMemoryDb.findBookingsByCarAndDateRange(
          carId,
          new Date("2025-01-01"),
          new Date("2025-02-01"),
        ),
      ).toEqual([]);
    });

    it("finds overlapping bookings", async () => {
      const booking = await inMemoryDb.createBookingRecord(baseBooking);

      const foundByUser = await inMemoryDb.findBookingsByUserAndDateRange(
        userId,
        new Date("2025-01-09"),
        new Date("2025-01-11"),
      );
      expect(foundByUser).toContainEqual(booking);

      const foundByCar = await inMemoryDb.findBookingsByCarAndDateRange(
        carId,
        new Date("2025-01-11"),
        new Date("2025-01-13"),
      );
      expect(foundByCar).toContainEqual(booking);
    });

    it("does not return non-overlapping bookings", async () => {
      await inMemoryDb.createBookingRecord(baseBooking);

      expect(
        await inMemoryDb.findBookingsByUserAndDateRange(
          userId,
          new Date("2025-01-01"),
          new Date("2025-01-09"),
        ),
      ).toEqual([]);

      expect(
        await inMemoryDb.findBookingsByCarAndDateRange(
          carId,
          new Date("2025-01-13"),
          new Date("2025-01-20"),
        ),
      ).toEqual([]);
    });
  });

  describe("Users", () => {
    const dto: CreateUserDTO = {
      email: "test@example.com",
      drivingLicenseValidUntil: new Date("2025-08-01"),
    };

    it("creates and retrieves users by email and id", async () => {
      const user = await inMemoryDb.createUser(dto);

      expect(user).toMatchObject({
        email: dto.email,
        drivingLicenseValidUntil: new Date(dto.drivingLicenseValidUntil),
      });
      expect(user).toHaveProperty("id");

      expect(await inMemoryDb.findUserByEmail(dto.email)).toEqual(user);
      expect(await inMemoryDb.findUserById(user.id)).toEqual(user);
    });

    it("throws when updating non-existent user", async () => {
      await expect(
        inMemoryDb.updateUserLicense("no-such-id", "2025-05-01"),
      ).rejects.toThrow("User not found");
    });
  });
});
