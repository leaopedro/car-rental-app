export type Season = "peak" | "mid" | "off";

export type Car = {
  id: string;
  brand: string;
  model: string;
  pricing: { season: Season; pricePerDay: number }[];
  imageURL: string;
};

export type Booking = {
  id: string;
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
};

export type BookingDTO = {
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice?: number;
};

export type User = {
  id: string;
  email: string;
  drivingLicenseValidUntil: Date;
};

export type CreateUserDTO = {
  email: string;
  drivingLicenseValidUntil: Date;
};
