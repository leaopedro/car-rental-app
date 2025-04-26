import { Car } from "../models/types";
import CarModel from "../models/carModel";

class AvailabilityService {
  async listAvailable(startDate: Date, endDate: Date): Promise<Car[]> {
    return CarModel.listAvailable(startDate, endDate);
  }
}

export default new AvailabilityService();
