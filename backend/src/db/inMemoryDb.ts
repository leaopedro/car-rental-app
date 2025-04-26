import { DBClient } from "./interface";
import { Car, Booking, User, CreateUserDTO } from "../models/types";
import { v4 as uuidv4 } from "uuid";
import { initialCars } from "../data/initialCars";

const carStore: Car[] = [];
const bookingStore: Booking[] = [];
const userStore: User[] = [];

function overlaps(b: Booking, start: Date, end: Date): boolean {
  return b.startDate <= end && b.endDate >= start;
}

export const inMemoryDb: DBClient = {
  async init() {
    carStore.splice(0, carStore.length, ...initialCars);
  },

  async getAllCars() {
    return [...carStore];
  },

  async findBookingsByUserAndDateRange(userId, start, end) {
    return bookingStore.filter(
      (b) => b.userId === userId && overlaps(b, start, end),
    );
  },

  async findBookingsByCarAndDateRange(carId, start, end) {
    return bookingStore.filter(
      (b) => b.carId === carId && overlaps(b, start, end),
    );
  },

  async createBookingRecord(data) {
    const booking = { ...data, id: uuidv4() } as Booking;
    bookingStore.push(booking);
    return booking;
  },
  async findUserById(id) {
    return userStore.find((u) => u.id === id) || null;
  },

  async findUserByEmail(email) {
    return userStore.find((u) => u.email === email) || null;
  },

  async createUser({ email, drivingLicenseValidUntil }: CreateUserDTO) {
    const existing = userStore.find((u) => u.email === email);
    if (existing) {
      return existing;
    }
    const user: User = {
      id: uuidv4(),
      email,
      drivingLicenseValidUntil: new Date(drivingLicenseValidUntil),
    };
    userStore.push(user);
    return user;
  },

  async updateUserLicense(id, drivingLicenseValidUntil) {
    const u = userStore.find((u) => u.id === id);
    if (!u) throw new Error("User not found");
    u.drivingLicenseValidUntil = new Date(drivingLicenseValidUntil);
    return u;
  },
};
