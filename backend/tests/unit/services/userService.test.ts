import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../../src/services/userService";
import UserModel from "../../../src/models/userModel";
import type { CreateUserDTO, User } from "../../../src/models/types";

vi.mock("../../../src/models/userModel");

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("calls UserModel.create when no existing user", async () => {
      const dto: CreateUserDTO = {
        email: "foo@example.com",
        drivingLicenseValidUntil: new Date("2025-05-01"),
      };

      vi.mocked(UserModel.findByEmail).mockResolvedValue(null);

      const newUser: User = {
        id: "user-1",
        email: dto.email,
        drivingLicenseValidUntil: dto.drivingLicenseValidUntil,
      };
      vi.mocked(UserModel.create).mockResolvedValue(newUser);

      const result = await UserService.createUser(dto);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(UserModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(newUser);
    });

    it("calls UserModel.updateLicense when user exists", async () => {
      const dto: CreateUserDTO = {
        email: "bar@example.com",
        drivingLicenseValidUntil: new Date("2025-06-15"),
      };

      const existing: User = {
        id: "user-2",
        email: dto.email,
        drivingLicenseValidUntil: new Date("2025-04-01"),
      };
      vi.mocked(UserModel.findByEmail).mockResolvedValue(existing);

      const updated: User = {
        ...existing,
        drivingLicenseValidUntil: dto.drivingLicenseValidUntil,
      };
      vi.mocked(UserModel.updateLicense).mockResolvedValue(updated);

      const result = await UserService.createUser(dto);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(UserModel.updateLicense).toHaveBeenCalledWith(
        existing.id,
        dto.drivingLicenseValidUntil.toISOString(),
      );
      expect(result).toEqual(updated);
    });
  });

  describe("getUserById", () => {
    it("returns the user when found", async () => {
      const user: User = {
        id: "user-3",
        email: "baz@example.com",
        drivingLicenseValidUntil: new Date("2025-07-20"),
      };
      vi.mocked(UserModel.findById).mockResolvedValue(user);

      const result = await UserService.getUserById(user.id);

      expect(UserModel.findById).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(user);
    });

    it("throws if user not found", async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      await expect(UserService.getUserById("no-such-id")).rejects.toThrow(
        "User not found",
      );
      expect(UserModel.findById).toHaveBeenCalledWith("no-such-id");
    });
  });
});
