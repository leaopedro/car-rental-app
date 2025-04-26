import db from "../db";
import { Car } from "./types";
import { getSeason } from "../utils/season";

export interface AvailableCar extends Car {
  totalPrice: number;
  averageDailyPrice: number;
}

function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

export default class CarModel {
  static findAll() {
    return db.getAllCars();
  }

  static async listAvailable(start: Date, end: Date): Promise<AvailableCar[]> {
    const cars = await db.getAllCars();
    const dates = getDatesInRange(start, end);
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
