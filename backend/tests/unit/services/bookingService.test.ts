import { describe, it, expect, beforeEach, vi } from "vitest";
import BookingService from "../../../src/services/bookingService";
import BookingModel from "../../../src/models/bookingModel";
import CarModel from "../../../src/models/carModel";
import UserModel from "../../../src/models/userModel";
import type { BookingDTO, Booking } from "../../../src/models/types";

vi.mock("../../../src/models/bookingModel");
vi.mock("../../../src/models/carModel");
vi.mock("../../../src/models/userModel");

describe("BookingService.createBooking", () => {
  const userId = "user-1";
  const carId = "car-1";
  const startDate = new Date("2025-04-01");
  const endDate = new Date("2025-04-02");

  const baseRequest: BookingDTO = { userId, carId, startDate, endDate };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws if user not found", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue(null);

    await expect(BookingService.createBooking(baseRequest)).rejects.toThrow(
      "User not found",
    );
  });

  it("throws if license expires before endDate", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue({
      id: userId,
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-03-01"),
    });

    await expect(BookingService.createBooking(baseRequest)).rejects.toThrow(
      "Driving license must be valid through the end of the booking period",
    );
  });

  it("throws if user has conflicting booking", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue({
      id: userId,
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-12-31"),
    });
    vi.mocked(BookingModel.findByUserAndDateRange).mockResolvedValue([
      {} as Booking,
    ]);

    await expect(BookingService.createBooking(baseRequest)).rejects.toThrow(
      "User already has a booking in the given date range",
    );
  });

  it("throws if car is already booked in range", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue({
      id: userId,
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-12-31"),
    });
    vi.mocked(BookingModel.findByUserAndDateRange).mockResolvedValue([]);
    vi.mocked(BookingModel.findByCarAndDateRange).mockResolvedValue([
      {} as Booking,
    ]);

    await expect(BookingService.createBooking(baseRequest)).rejects.toThrow(
      "Car is not available for the selected date range",
    );
  });

  it("throws if car not found", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue({
      id: userId,
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-12-31"),
    });
    vi.mocked(BookingModel.findByUserAndDateRange).mockResolvedValue([]);
    vi.mocked(BookingModel.findByCarAndDateRange).mockResolvedValue([]);
    vi.mocked(CarModel.findAll).mockResolvedValue([]);

    await expect(BookingService.createBooking(baseRequest)).rejects.toThrow(
      "Car not found",
    );
  });

  it("throws if missing seasonal pricing", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue({
      id: userId,
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-12-31"),
    });
    vi.mocked(BookingModel.findByUserAndDateRange).mockResolvedValue([]);
    vi.mocked(BookingModel.findByCarAndDateRange).mockResolvedValue([]);
    vi.mocked(CarModel.findAll).mockResolvedValue([
      {
        id: carId,
        brand: "A",
        model: "B",
        pricing: [{ season: "off", pricePerDay: 50 }],
        imageURL: "",
      },
    ]);

    await expect(BookingService.createBooking(baseRequest)).rejects.toThrow(
      "No pricing defined for season 'mid'",
    );
  });

  it("creates booking successfully with correct totalPrice", async () => {
    vi.mocked(UserModel.findById).mockResolvedValue({
      id: userId,
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-12-31"),
    });
    vi.mocked(BookingModel.findByUserAndDateRange).mockResolvedValue([]);
    vi.mocked(BookingModel.findByCarAndDateRange).mockResolvedValue([]);
    vi.mocked(CarModel.findAll).mockResolvedValue([
      {
        id: carId,
        brand: "A",
        model: "B",
        pricing: [{ season: "mid", pricePerDay: 75 }],
        imageURL: "",
      },
    ]);
    vi.mocked(BookingModel.create).mockImplementation(async (b: any) => ({
      ...b,
      id: "booking-1",
    }));

    const booking = await BookingService.createBooking(baseRequest);

    expect(booking).toEqual({
      id: "booking-1",
      userId,
      carId,
      startDate,
      endDate,
      totalPrice: 75,
    });
    expect(BookingModel.create).toHaveBeenCalledWith({
      ...baseRequest,
      totalPrice: 75,
    } as Booking);
  });
});
