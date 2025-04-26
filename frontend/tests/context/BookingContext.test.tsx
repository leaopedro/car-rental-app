import { renderHook, act } from "@testing-library/react";
import { BookingProvider, useBooking } from "../../src/context/BookingContext";
import { describe, it, expect } from "vitest";

describe("BookingContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BookingProvider>{children}</BookingProvider>
  );

  it("provides default initial values", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    expect(result.current.car).toBe(null);
    expect(result.current.startDate).toBe("");
    expect(result.current.endDate).toBe("");
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.averageDailyPrice).toBe(0);
    expect(result.current.quoteFetched).toBe(false);
  });

  it("sets a booking correctly", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.setBooking({
        car: {
          id: "1",
          brand: "Tesla",
          model: "Model S",
          imageURL: "some-url",
          pricing: [],
          totalPrice: 400,
          averageDailyPrice: 200,
        },
        startDate: "2025-01-01",
        endDate: "2025-01-05",
      });
    });

    expect(result.current.car?.brand).toBe("Tesla");
    expect(result.current.startDate).toBe("2025-01-01");
    expect(result.current.endDate).toBe("2025-01-05");
    expect(result.current.totalPrice).toBe(400);
    expect(result.current.averageDailyPrice).toBe(200);
    expect(result.current.quoteFetched).toBe(true);
  });

  it("updates dates and clears quoteFetched", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.updateDates("2025-02-01", "2025-02-10");
    });

    expect(result.current.startDate).toBe("2025-02-01");
    expect(result.current.endDate).toBe("2025-02-10");
    expect(result.current.quoteFetched).toBe(false);
  });

  it("updates the quote correctly", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.updateQuote(500, 250);
    });

    expect(result.current.totalPrice).toBe(500);
    expect(result.current.averageDailyPrice).toBe(250);
    expect(result.current.quoteFetched).toBe(true);
  });

  it("clears booking data", () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.clearBooking();
    });

    expect(result.current.car).toBe(null);
    expect(result.current.startDate).toBe("");
    expect(result.current.endDate).toBe("");
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.averageDailyPrice).toBe(0);
    expect(result.current.quoteFetched).toBe(false);
  });
});
