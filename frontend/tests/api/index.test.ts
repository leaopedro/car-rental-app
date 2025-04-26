import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAvailability,
  fetchCarPricing,
  createUser,
  createBooking,
} from "../../src/api";

const mockFetch = vi.fn();

globalThis.fetch = mockFetch;

describe("API module", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches availability successfully", async () => {
    const mockCars = [
      {
        id: "1",
        brand: "Tesla",
        model: "Model S",
        imageURL: "img.png",
        totalPrice: 100,
        averageDailyPrice: 50,
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockCars),
    });

    const result = await fetchAvailability("2025-01-01", "2025-01-02");
    expect(result).toEqual(mockCars);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/availability?startDate=2025-01-01&endDate=2025-01-02",
      ),
      expect.anything(),
    );
  });

  it("fetches car pricing successfully", async () => {
    const mockPricing = [
      {
        id: "1",
        brand: "Tesla",
        model: "Model S",
        imageURL: "img.png",
        totalPrice: 200,
        averageDailyPrice: 100,
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockPricing),
    });

    const result = await fetchCarPricing("2025-01-01", "2025-01-02", "1");
    expect(result).toEqual(mockPricing);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/availability?startDate=2025-01-01&endDate=2025-01-02&carId=1",
      ),
      expect.anything(),
    );
  });

  it("creates a user successfully", async () => {
    const mockUser = {
      id: "user1",
      email: "test@email.com",
      drivingLicenseValidUntil: "2030-01-01",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockUser),
    });

    const result = await createUser({
      email: "test@email.com",
      drivingLicenseValidUntil: "2030-01-01",
    });
    expect(result).toEqual(mockUser);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("creates a booking successfully", async () => {
    const mockBooking = {
      id: "booking1",
      userId: "user1",
      carId: "car1",
      startDate: "2025-01-01",
      endDate: "2025-01-02",
      totalPrice: 100,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockBooking),
    });

    const result = await createBooking({
      userId: "user1",
      carId: "car1",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-02"),
    });
    expect(result).toEqual(mockBooking);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/booking"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws an error when fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
      text: async () => "Something went wrong",
    });

    await expect(fetchAvailability("2025-01-01", "2025-01-02")).rejects.toThrow(
      "Something went wrong",
    );
  });

  it("throws a combined error for Zod errors array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () =>
        JSON.stringify({
          errors: [
            { message: "Email invalid" },
            { message: "License required" },
          ],
        }),
    });

    await expect(
      createUser({ email: "", drivingLicenseValidUntil: "" }),
    ).rejects.toThrow("Email invalid, License required");
  });
});
