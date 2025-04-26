import { DBClient } from "./interface";
import { Car, Booking, CreateUserDTO, User } from "../models/types";
import knex from "knex";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, DB_CLIENT } =
  process.env;
if (
  DB_CLIENT === "postgres" &&
  (!PGHOST || !PGUSER || !PGPASSWORD || !PGDATABASE)
) {
  throw new Error(
    "Missing required Postgres env vars. Please set PGHOST, PGUSER, PGPASSWORD, PGDATABASE.",
  );
}

const db = knex({
  client: "pg",
  connection: {
    host: PGHOST,
    port: parseInt(PGPORT || "5432", 10),
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
  },
  migrations: {
    directory: "./src/db/migrations",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
});

export const postgresDb: DBClient = {
  async init(): Promise<void> {
    await db.migrate.latest();
  },

  async getAllCars(): Promise<Car[]> {
    const rows = await db<{
      id: string;
      brand: string;
      model: string;
      pricing: string;
      image_url: string;
    }>("cars").select("*");

    return rows.map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      pricing:
        typeof r.pricing === "string" ? JSON.parse(r.pricing) : r.pricing,
      imageURL: r.image_url,
    }));
  },

  async findBookingsByUserAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]> {
    const rows = await db<{
      id: string;
      user_id: string;
      car_id: string;
      start_date: string;
      end_date: string;
      total_price: string;
    }>("bookings")
      .where("user_id", userId)
      .andWhere("start_date", "<=", end.toISOString())
      .andWhere("end_date", ">=", start.toISOString())
      .select("*");

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      carId: r.car_id,
      startDate: new Date(r.start_date),
      endDate: new Date(r.end_date),
      totalPrice: parseFloat(r.total_price),
    }));
  },

  async findBookingsByCarAndDateRange(
    carId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]> {
    const rows = await db<{
      id: string;
      user_id: string;
      car_id: string;
      start_date: string;
      end_date: string;
      total_price: string;
    }>("bookings")
      .where("car_id", carId)
      .andWhere("start_date", "<=", end.toISOString())
      .andWhere("end_date", ">=", start.toISOString())
      .select("*");

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      carId: r.car_id,
      startDate: new Date(r.start_date),
      endDate: new Date(r.end_date),
      totalPrice: parseFloat(r.total_price),
    }));
  },

  async createBookingRecord(data: Booking): Promise<Booking> {
    const [row] = await db<{
      id: string;
      user_id: string;
      car_id: string;
      start_date: string;
      end_date: string;
      total_price: string;
    }>("bookings")
      .insert({
        user_id: data.userId,
        car_id: data.carId,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate.toISOString(),
        total_price: data.totalPrice ? data.totalPrice.toString() : "0",
      })
      .returning("*");

    return {
      id: row.id,
      userId: row.user_id,
      carId: row.car_id,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      totalPrice: parseFloat(row.total_price),
    };
  },

  async findUserById(id) {
    const row = await db("users").where({ id }).first();
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      drivingLicenseValidUntil: new Date(row.driving_license_valid_until),
    };
  },

  async findUserByEmail(email) {
    const row = await db("users").where({ email }).first();
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      drivingLicenseValidUntil: new Date(row.driving_license_valid_until),
    };
  },

  async createUser({
    email,
    drivingLicenseValidUntil,
  }: CreateUserDTO): Promise<User> {
    const [row] = await db("users")
      .insert({
        id: uuidv4(),
        email,
        driving_license_valid_until: drivingLicenseValidUntil,
      })
      .returning(["id", "email", "driving_license_valid_until"]);
    return {
      id: row.id,
      email: row.email,
      drivingLicenseValidUntil: new Date(row.driving_license_valid_until),
    };
  },

  async updateUserLicense(id, drivingLicenseValidUntil) {
    const [row] = await db("users")
      .where({ id })
      .update({
        driving_license_valid_until: drivingLicenseValidUntil,
      })
      .returning(["id", "email", "driving_license_valid_until"]);
    return {
      id: row.id,
      email: row.email,
      drivingLicenseValidUntil: new Date(row.driving_license_valid_until),
    };
  },
};
