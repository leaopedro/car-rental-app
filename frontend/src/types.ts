export type Season = "peak" | "mid" | "off";

export interface Car {
  id: string;
  brand: string;
  model: string;
  pricing: { season: Season; pricePerDay: number }[];
  imageURL: string;
}

export interface AvailableCar extends Car {
  totalPrice: number;
  averageDailyPrice: number;
}

export interface CreateUserDTO {
  email: string;
  drivingLicenseValidUntil: string;
}

export interface User extends CreateUserDTO {
  id: string;
}
export interface BookingDTO {
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
}

export interface Booking extends BookingDTO {
  id: string;
}
