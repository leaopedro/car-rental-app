import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../../src/components/Input";
import { describe, it, vi, expect } from "vitest";

describe("Input", () => {
  it("renders label and input correctly", () => {
    render(
      <Input
        label="Pick-up Date"
        id="pickup"
        value="2025-05-01"
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText(/Pick-up Date/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-05-01")).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    const onChange = vi.fn();

    render(
      <Input
        label="Drop-off Date"
        id="dropoff"
        value="2025-05-02"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText(/Drop-off Date/i);
    fireEvent.change(input, { target: { value: "2025-05-03" } });

    expect(onChange).toHaveBeenCalledWith("2025-05-03");
  });

  it("calls onBlur when input loses focus", () => {
    const onBlur = vi.fn();

    render(
      <Input
        label="Pick-up Date"
        id="pickup"
        value="2025-05-01"
        onChange={() => {}}
        onBlur={onBlur}
      />,
    );

    const input = screen.getByLabelText(/Pick-up Date/i);
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalled();
  });
});
