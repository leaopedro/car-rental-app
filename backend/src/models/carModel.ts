import db from "../db";
import { getDaysInRange, getSeason } from "../utils";
import { AvailableCar } from "./types";

export default class CarModel {
  static findAll() {
    return db.getAllCars();
  }

  static async listAvailable(start: Date, end: Date): Promise<AvailableCar[]> {
    const cars = await db.getAllCars();
    const dates = getDaysInRange(start, end);
    const days = dates.length;
    const available: AvailableCar[] = [];

    for (const car of cars) {
      const bookings = await db.findBookingsByCarAndDateRange(
        car.id,
        start,
        end,
      );
      if (bookings.length) continue;

      const totalPrice = dates.reduce((sum, day) => {
        const season = getSeason(day);
        const price =
          car.pricing.find((p) => p.season === season)?.pricePerDay ?? 0;
        return sum + price;
      }, 0);

      available.push({
        ...car,
        totalPrice,
        averageDailyPrice: days ? totalPrice / days : 0,
      });
    }

    return available;
  }
}
