import db from "../db";
import { User, CreateUserDTO } from "./types";

export default class UserModel {
  static findById(id: string): Promise<User | null> {
    return db.findUserById(id);
  }

  static findByEmail(email: string): Promise<User | null> {
    return db.findUserByEmail(email);
  }

  static create(dto: CreateUserDTO): Promise<User> {
    return db.createUser(dto);
  }

  static updateLicense(
    id: string,
    drivingLicenseValidUntil: string,
  ): Promise<User> {
    return db.updateUserLicense(id, drivingLicenseValidUntil);
  }
}
