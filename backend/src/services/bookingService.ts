import { BookingDTO, Booking, Car, User } from "../models/types";
import BookingModel from "../models/bookingModel";
import CarModel from "../models/carModel";
import UserModel from "../models/userModel";
import { getSeason } from "../utils";
import { sendBookingConfirmation } from "../external/emailService";

class BookingService {
  async createBooking(request: BookingDTO): Promise<Booking> {
    const { userId, carId, startDate, endDate } = request;

    console.log(
      `[BookingService] Creating booking for user=${userId} car=${carId}`,
    );

    const user = await this.validateUser(userId, endDate);
    await this.checkUserConflicts(userId, startDate, endDate);
    await this.checkCarAvailability(carId, startDate, endDate);

    const car = await this.findCar(carId);
    const totalPrice = this.calculateTotalPrice(car, startDate, endDate);

    const booking = await BookingModel.create({
      ...request,
      totalPrice,
    } as Booking);

    console.log(`[BookingService] Booking created with ID=${booking.id}`);
    try {
      await sendBookingConfirmation(
        user,
        car,
        booking.id,
        startDate,
        endDate,
        totalPrice,
      );
    } catch (error: unknown) {
      console.error(
        `[BookingService] Failed to send booking confirmation: ${error}`,
      );
    }
    return booking;
  }

  private async validateUser(userId: string, endDate: Date): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      console.error(`[BookingService] User not found: ${userId}`);
      throw new Error("User not found");
    }
    if (user.drivingLicenseValidUntil < endDate) {
      console.error(`[BookingService] License expired for user: ${userId}`);
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
  ): Promise<void> {
    const conflicts = await BookingModel.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );
    if (conflicts.length > 0) {
      console.warn(
        `[BookingService] User ${userId} has conflicting booking(s)`,
      );
      throw new Error("User already has a booking in the given date range");
    }
  }

  private async checkCarAvailability(
    carId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const conflicts = await BookingModel.findByCarAndDateRange(
      carId,
      startDate,
      endDate,
    );
    if (conflicts.length > 0) {
      console.warn(
        `[BookingService] Car ${carId} is not available for the selected dates`,
      );
      throw new Error("Car is not available for the selected date range");
    }
  }

  private async findCar(carId: string): Promise<Car> {
    const cars = await CarModel.findAll();
    const car = cars.find((c) => c.id === carId);
    if (!car) {
      console.error(`[BookingService] Car not found: ${carId}`);
      throw new Error("Car not found");
    }
    return car;
  }

  private calculateTotalPrice(
    car: Car,
    startDate: Date,
    endDate: Date,
  ): number {
    let totalPrice = 0;

    for (
      let day = new Date(startDate);
      day < endDate;
      day.setDate(day.getDate() + 1)
    ) {
      const season = getSeason(day);
      const priceObj = car.pricing.find((p) => p.season === season);
      if (!priceObj) {
        console.error(
          `[BookingService] No pricing found for season '${season}' on car ${car.id}`,
        );
        throw new Error(`No pricing defined for season '${season}'`);
      }
      totalPrice += priceObj.pricePerDay;
    }

    console.log(
      `[BookingService] Calculated total price: $${totalPrice.toFixed(2)}`,
    );
    return totalPrice;
  }
}

export default new BookingService();
