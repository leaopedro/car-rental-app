import db from "../db";
import { Booking, BookingDTO } from "./types";

class BookingModel {
  static async findByUserAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]> {
    return db.findBookingsByUserAndDateRange(userId, start, end);
  }
  static async findByCarAndDateRange(
    carId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]> {
    return db.findBookingsByCarAndDateRange(carId, start, end);
  }
  static async create(data: Booking): Promise<Booking> {
    return db.createBookingRecord(data);
  }
}
export default BookingModel;
