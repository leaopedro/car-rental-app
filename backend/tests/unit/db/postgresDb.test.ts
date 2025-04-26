import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import type {
  Car,
  Booking,
  CreateUserDTO,
  User,
} from "../../../src/models/types";

const mockMigrateLatest = vi.fn();
const mockSelect = vi.fn();
const mockWhere = vi.fn();
const mockFirst = vi.fn();
const mockInsert = vi.fn();
const mockReturning = vi.fn();
const mockUpdate = vi.fn();
const mockDel = vi.fn();

const fakeDb = vi.fn(() => fakeDb) as any;
fakeDb.migrate = { latest: mockMigrateLatest };
fakeDb.select = mockSelect;
fakeDb.where = mockWhere;
fakeDb.andWhere = mockWhere;
fakeDb.first = mockFirst;
fakeDb.insert = mockInsert;
fakeDb.returning = mockReturning;
fakeDb.update = mockUpdate;
fakeDb.del = mockDel;

vi.mock("knex", () => ({
  __esModule: true,
  default: vi.fn(() => fakeDb),
}));
vi.mock("uuid", () => ({ v4: () => "fixed-uuid" }));

let postgresDb: typeof import("../../../src/db/postgresDb").postgresDb;
beforeAll(async () => {
  const mod = await import("../../../src/db/postgresDb");
  postgresDb = mod.postgresDb;
});

describe("postgresDb (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockWhere.mockReturnValue(fakeDb);
    mockInsert.mockReturnValue(fakeDb);
    mockUpdate.mockReturnValue(fakeDb);

    mockSelect.mockResolvedValue([]);
    mockFirst.mockResolvedValue(null);
    mockReturning.mockImplementation(() => ({
      then: (cb: any) => cb([]),
    }));
  });

  it("init(): runs migrations.latest()", async () => {
    await postgresDb.init();
    expect(mockMigrateLatest).toHaveBeenCalled();
  });

  it("getAllCars(): maps rows correctly", async () => {
    const raw = [
      {
        id: "c1",
        brand: "B",
        model: "M",
        pricing: JSON.stringify([{ season: "off", pricePerDay: 10 }]),
        image_url: "img.png",
      },
    ];
    mockSelect.mockResolvedValueOnce(raw);

    const cars: Car[] = await postgresDb.getAllCars();
    expect(cars).toEqual([
      {
        id: "c1",
        brand: "B",
        model: "M",
        pricing: [{ season: "off", pricePerDay: 10 }],
        imageURL: "img.png",
      },
    ]);
  });

  it("findBookingsByUserAndDateRange(): returns mapped Booking[]", async () => {
    const row = {
      id: "b1",
      user_id: "u1",
      car_id: "c1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      total_price: "123.45",
    };
    mockWhere.mockReturnValue(fakeDb);
    mockSelect.mockResolvedValueOnce([row]);

    const out = await postgresDb.findBookingsByUserAndDateRange(
      "u1",
      new Date("2025-01-01"),
      new Date("2025-01-02"),
    );
    expect(out).toEqual([
      {
        id: "b1",
        userId: "u1",
        carId: "c1",
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        totalPrice: 123.45,
      },
    ]);
  });

  it("createBookingRecord(): inserts then returns Booking", async () => {
    const input: Omit<Booking, "id"> = {
      userId: "u1",
      carId: "c1",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-02"),
      totalPrice: 99.99,
    };
    const inserted = {
      id: "b1",
      user_id: input.userId,
      car_id: input.carId,
      start_date: input.startDate.toISOString(),
      end_date: input.endDate.toISOString(),
      total_price: input.totalPrice.toString(),
    };
    mockReturning.mockImplementationOnce(() => ({
      then: (cb: any) => cb([inserted]),
    }));

    const b = await postgresDb.createBookingRecord(input as any);
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: input.userId,
      car_id: input.carId,
      start_date: input.startDate.toISOString(),
      end_date: input.endDate.toISOString(),
      total_price: input.totalPrice.toString(),
    });
    expect(b).toEqual({
      id: "b1",
      userId: "u1",
      carId: "c1",
      startDate: new Date(inserted.start_date),
      endDate: new Date(inserted.end_date),
      totalPrice: 99.99,
    });
  });

  it("findUserByEmail() & findUserById()", async () => {
    const urow = {
      id: "u1",
      email: "x@y.com",
      driving_license_valid_until: "2025-12-31T00:00:00.000Z",
    };
    mockFirst.mockResolvedValueOnce(urow);
    const byEmail = await postgresDb.findUserByEmail("x@y.com");
    expect(byEmail).toEqual({
      id: "u1",
      email: "x@y.com",
      drivingLicenseValidUntil: new Date(urow.driving_license_valid_until),
    });

    mockFirst.mockResolvedValueOnce(null);
    const byId = await postgresDb.findUserById("nope");
    expect(byId).toBeNull();
  });

  it("createUser(): inserts new record", async () => {
    const dto: CreateUserDTO = {
      email: "a@b.com",
      drivingLicenseValidUntil: new Date("2025-08-01T00:00:00.000Z"),
    };
    const row = {
      id: "u1",
      email: dto.email,
      driving_license_valid_until: dto.drivingLicenseValidUntil,
    };
    mockReturning.mockImplementationOnce(() => ({
      then: (cb: any) => cb([row]),
    }));

    const u = await postgresDb.createUser(dto);
    expect(u).toEqual({
      id: "u1",
      email: dto.email,
      drivingLicenseValidUntil: new Date(dto.drivingLicenseValidUntil),
    });
  });

  it("updateUserLicense(): maps update → returning", async () => {
    const row = {
      id: "u1",
      email: "x@y.com",
      driving_license_valid_until: "2025-10-10T00:00:00.000Z",
    };
    mockUpdate.mockReturnValue(fakeDb);
    mockReturning.mockImplementationOnce(() => ({
      then: (cb: any) => cb([row]),
    }));

    const u = await postgresDb.updateUserLicense(
      "u1",
      "2025-10-10T00:00:00.000Z",
    );
    expect(u).toEqual({
      id: "u1",
      email: "x@y.com",
      drivingLicenseValidUntil: new Date(row.driving_license_valid_until),
    });
  });
});
