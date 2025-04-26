import { render, screen, fireEvent } from "@testing-library/react";
import CarCard from "../../src/components/CarCard";
import { describe, it, expect, vi } from "vitest";

describe("CarCard", () => {
  const mockCar = {
    id: "car-1",
    brand: "BrandX",
    model: "ModelY",
    imageURL: "https://example.com/car.jpg",
    pricing: [],
    totalPrice: 200,
    averageDailyPrice: 100,
  };

  const mockOnClick = vi.fn();

  it("renders car information correctly", () => {
    render(<CarCard car={mockCar} onClick={mockOnClick} />);

    expect(screen.getByText(/BrandX ModelY/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: \$200.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg \/ day: \$100.00/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Book Now/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    render(<CarCard car={mockCar} onClick={mockOnClick} />);

    const card = screen.getByRole("img", {
      name: /BrandX ModelY/i,
    }).parentElement!;
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockCar);
  });

  it("handles missing prices safely", () => {
    const brokenCar = {
      ...mockCar,
      totalPrice: undefined,
      averageDailyPrice: undefined,
    };

    // expected type mismatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<CarCard car={brokenCar as any} onClick={mockOnClick} />);

    expect(screen.getByText(/Total: \$0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg \/ day: \$0.00/i)).toBeInTheDocument();
  });
});
