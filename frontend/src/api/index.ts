import {
  AvailableCar,
  Booking,
  BookingDTO,
  CreateUserDTO,
  User,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const errorMessage = Array.isArray(data?.errors)
      ? (data.errors as { message?: string }[])
          .map((e) => e.message || "")
          .join(", ")
      : typeof data === "string" && data
        ? data
        : (data?.message ?? res.statusText);

    throw new Error(errorMessage);
  }

  return data;
}

export const fetchAvailability = (
  startDate: string,
  endDate: string,
): Promise<AvailableCar[]> =>
  request(
    `/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );

export const fetchCarPricing = (
  startDate: string,
  endDate: string,
  carId: string,
): Promise<AvailableCar[]> =>
  request(
    `/availability?${new URLSearchParams({ startDate, endDate, carId })}`,
  );

export const createUser = (data: CreateUserDTO): Promise<User> =>
  request("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createBooking = (data: BookingDTO): Promise<Booking> =>
  request("/booking", {
    method: "POST",
    body: JSON.stringify(data),
  });
