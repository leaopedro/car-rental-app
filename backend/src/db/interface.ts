import { Car, Booking, CreateUserDTO, User, BookingDTO } from "../models/types";

//Common interface
export interface DBClient {
  init(): Promise<void>;
  getAllCars(): Promise<Car[]>;
  findBookingsByUserAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]>;
  findBookingsByCarAndDateRange(
    carId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]>;
  createBookingRecord(data: BookingDTO): Promise<Booking>;
  createUser(data: CreateUserDTO): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateUserLicense(
    id: string,
    drivingLicenseValidUntil: string,
  ): Promise<User>;
}
