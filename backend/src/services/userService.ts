import { CreateUserDTO, User } from "../models/types";
import UserModel from "../models/userModel";

class UserService {
  async createUser(dto: CreateUserDTO): Promise<User> {
    // if exist, update license
    const existing = await UserModel.findByEmail(dto.email);
    if (existing) {
      return UserModel.updateLicense(
        existing.id,
        dto.drivingLicenseValidUntil.toISOString(),
      );
    }
    return UserModel.create(dto);
  }

  async getUserById(id: string): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }
}

export default new UserService();
