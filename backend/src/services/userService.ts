import { CreateUserDTO, User } from "../models/types";
import UserModel from "../models/userModel";

class UserService {
  async createUser(dto: CreateUserDTO): Promise<User> {
    console.log(`[UserService] Creating or updating user: ${dto.email}`);

    const existing = await UserModel.findByEmail(dto.email);
    if (existing) {
      console.log(
        `[UserService] User already exists. Updating license for userId=${existing.id}`,
      );
      return UserModel.updateLicense(
        existing.id,
        dto.drivingLicenseValidUntil.toISOString(),
      );
    }

    const newUser = await UserModel.create(dto);
    console.log(`[UserService] New user created with ID=${newUser.id}`);
    return newUser;
  }

  async getUserById(id: string): Promise<User> {
    console.log(`[UserService] Fetching user by ID=${id}`);

    const user = await UserModel.findById(id);
    if (!user) {
      console.error(`[UserService] User not found: ID=${id}`);
      throw new Error("User not found");
    }

    return user;
  }
}

export default new UserService();
