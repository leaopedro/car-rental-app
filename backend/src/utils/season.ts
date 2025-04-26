import { Season } from "../models/types";

export function getSeason(date: Date): Season {
  const y = date.getFullYear();
  const jun1 = new Date(y, 5, 1);
  const sep15 = new Date(y, 8, 15);
  const oct31 = new Date(y, 9, 31);
  const mar1 = new Date(y, 2, 1);

  if (date >= jun1 && date <= sep15) return "peak";
  if ((date > sep15 && date <= oct31) || (date >= mar1 && date < jun1))
    return "mid";
  return "off";
}
