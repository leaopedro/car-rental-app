import { BookingDTO, Booking, Car } from "../models/types";
import BookingModel from "../models/bookingModel";
import CarModel from "../models/carModel";
import UserModel from "../models/userModel";
import { getSeason } from "../utils/season";

class BookingService {
  async createBooking(request: BookingDTO): Promise<Booking> {
    const { userId, carId, startDate, endDate } = request;

    const user = await this.validateUser(userId, endDate);
    await this.checkUserConflicts(userId, startDate, endDate);
    await this.checkCarAvailability(carId, startDate, endDate);

    const car = await this.findCar(carId);
    const totalPrice = this.calculateTotalPrice(car, startDate, endDate);

    const booking = await BookingModel.create({
      ...request,
      totalPrice,
    } as Booking);

    return booking;
  }

  private async validateUser(userId: string, endDate: Date) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.drivingLicenseValidUntil < endDate) {
      throw new Error(
        "Driving license must be valid through the end of the booking period",
      );
    }
    return user;
  }

  private async checkUserConflicts(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const conflicts = await BookingModel.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );
    if (conflicts.length > 0) {
      throw new Error("User already has a booking in the given date range");
    }
  }

  private async checkCarAvailability(
    carId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const conflicts = await BookingModel.findByCarAndDateRange(
      carId,
      startDate,
      endDate,
    );
    if (conflicts.length > 0) {
      throw new Error("Car is not available for the selected date range");
    }
  }

  private async findCar(carId: string): Promise<Car> {
    const cars = await CarModel.findAll();
    const car = cars.find((c) => c.id === carId);
    if (!car) {
      throw new Error("Car not found");
    }
    return car;
  }

  private calculateTotalPrice(car: Car, startDate: Date, endDate: Date) {
    let totalPrice = 0;

    for (
      let day = new Date(startDate);
      day < endDate;
      day.setDate(day.getDate() + 1)
    ) {
      const season = getSeason(day);
      const priceObj = car.pricing.find((p) => p.season === season);
      if (!priceObj) {
        throw new Error(`No pricing defined for season '${season}'`);
      }
      totalPrice += priceObj.pricePerDay;
    }

    return totalPrice;
  }
}

export default new BookingService();
