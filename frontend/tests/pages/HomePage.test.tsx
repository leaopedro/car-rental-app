import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, Mock } from "vitest";
import { useNavigate } from "react-router-dom";
import * as api from "../../src/api";
import * as bookingCtx from "../../src/context/BookingContext";
import HomePage from "../../src/pages/HomePage";

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

describe("HomePage", () => {
  const mockNavigate = vi.fn();
  const mockSetBooking = vi.fn();
  const mockClearBooking = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (bookingCtx.useBooking as Mock).mockReturnValue({
      setBooking: mockSetBooking,
      clearBooking: mockClearBooking,
    });
  });

  it("renders pickup and dropoff inputs and search button", () => {
    render(<HomePage />);

    expect(screen.getByLabelText(/Pick-up/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Drop-off/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
  });

  it("shows validation error if submitting without dates", async () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText(/Pick-up/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/Drop-off/i), {
      target: { value: "" },
    });

    const searchButton = screen.getByRole("button", { name: /Search/i });
    await userEvent.click(searchButton);

    expect(
      await screen.findByText(/Please select both dates\./i),
    ).toBeVisible();
  });

  it("fetches and displays available cars after search", async () => {
    (api.fetchAvailability as Mock).mockResolvedValue([
      {
        id: "1",
        brand: "BrandA",
        model: "ModelA",
        imageURL: "img.png",
        totalPrice: 100,
        averageDailyPrice: 50,
      },
      {
        id: "2",
        brand: "BrandB",
        model: "ModelB",
        imageURL: "img2.png",
        totalPrice: 200,
        averageDailyPrice: 100,
      },
    ]);

    render(<HomePage />);

    const searchButton = screen.getByRole("button", { name: /Search/i });
    await userEvent.click(searchButton);

    expect(await screen.findByText(/BrandA ModelA/i)).toBeVisible();
    expect(await screen.findByText(/BrandB ModelB/i)).toBeVisible();
  });

  it('shows "No cars available" if none are returned', async () => {
    (api.fetchAvailability as Mock).mockResolvedValue([]);

    render(<HomePage />);

    const searchButton = screen.getByRole("button", { name: /Search/i });
    await userEvent.click(searchButton);

    expect(await screen.findByText(/No cars available\./i)).toBeVisible();
  });

  it("navigates to booking page when clicking a car", async () => {
    (api.fetchAvailability as Mock).mockResolvedValue([
      {
        id: "1",
        brand: "BrandA",
        model: "ModelA",
        imageURL: "img.png",
        totalPrice: 100,
        averageDailyPrice: 50,
      },
    ]);

    render(<HomePage />);

    const searchButton = screen.getByRole("button", { name: /Search/i });
    await userEvent.click(searchButton);

    const carCard = await screen.findByText(/BrandA ModelA/i);

    await userEvent.click(carCard);

    expect(mockSetBooking).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/booking");
  });
});
