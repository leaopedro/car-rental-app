import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingPage from "../../src/pages/BookingPage";
import * as api from "../../src/api";
import * as bookingCtx from "../../src/context/BookingContext";
import { useNavigate } from "react-router-dom";
import { vi, describe, it, beforeEach, expect, Mock } from "vitest";

vi.mock("../../src/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
vi.mock("../../src/context/BookingContext", () => ({
  useBooking: vi.fn(),
}));

describe("BookingPage", () => {
  const mockNavigate = vi.fn();
  const mockClearBooking = vi.fn();
  const mockUpdateDates = vi.fn();
  const mockUpdateQuote = vi.fn();

  const mockBookingContext = {
    car: {
      id: "car-1",
      brand: "BrandX",
      model: "ModelY",
      imageURL: "https://example.com.png",
    },
    startDate: "2025-05-01",
    endDate: "2025-05-03",
    quoteFetched: false,
    totalPrice: 100,
    averageDailyPrice: 50,
    updateDates: mockUpdateDates,
    updateQuote: mockUpdateQuote,
    clearBooking: mockClearBooking,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (bookingCtx.useBooking as unknown as Mock).mockReturnValue({
      ...mockBookingContext,
    });
    localStorage.clear();
  });

  it("renders car info and Back button", async () => {
    render(<BookingPage />);

    expect(screen.getByText(/BrandX ModelY/i)).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /^Back$/i });
    userEvent.click(backButton);

    await waitFor(() => {
      expect(mockClearBooking).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("disables Confirm Booking button until a quote is fetched", () => {
    render(<BookingPage />);
    const confirmButton = screen.getByRole("button", {
      name: /Confirm Booking/i,
    });
    expect(confirmButton).toBeDisabled();
  });

  it("shows validation error if submitting empty form after fetching a quote", async () => {
    (bookingCtx.useBooking as unknown as Mock).mockReturnValue({
      ...mockBookingContext,
      quoteFetched: true,
    });

    render(<BookingPage />);

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Booking/i,
    });
    expect(confirmButton).toBeEnabled();

    userEvent.click(confirmButton);

    expect(
      await screen.findByText(/Please fill in all fields\./i),
    ).toBeVisible();
  });

  it("fetches a new quote when Pick-up date input is blurred", async () => {
    render(<BookingPage />);

    const pickupInput = screen.getByLabelText(/Pick-up/i);
    fireEvent.blur(pickupInput);

    await waitFor(() => {
      expect(api.fetchCarPricing).toHaveBeenCalledWith(
        mockBookingContext.startDate,
        mockBookingContext.endDate,
        mockBookingContext.car.id,
      );
    });
  });

  it("submits successfully and shows success screen", async () => {
    (bookingCtx.useBooking as Mock).mockReturnValue({
      ...mockBookingContext,
      quoteFetched: true,
    });
    (api.createUser as Mock).mockResolvedValue({
      id: "u1",
      email: "test@email.com",
      drivingLicenseValidUntil: "2030-01-01T00:00:00.000Z",
    });
    (api.createBooking as Mock).mockResolvedValue({
      id: "b1",
      userId: "u1",
      carId: "car-1",
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-03"),
      totalPrice: 100,
    });

    render(<BookingPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), "test@email.com");
    await userEvent.type(
      screen.getByLabelText(/License valid until/i),
      "2030-01-01",
    );

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Booking/i,
    });
    await userEvent.click(confirmButton);

    const successTitle = await screen.findByRole("heading", {
      name: /Booked!/i,
    });
    expect(successTitle).toBeVisible();

    const backHomeButton = screen.getByRole("button", {
      name: /Back to Home/i,
    });
    expect(backHomeButton).toBeVisible();
  });
});
