import { Router, NextFunction, Response } from "express";
import { z } from "zod";
import availabilityService from "../services/availabilityService";

export type AvailabilityQuery = {
  startDate: string;
  endDate: string;
  carId?: string;
};

const router = Router();

const dateSchema = z
  .string()
  .refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date format" });

const availabilitySchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
    carId: z.string().uuid().optional(),
  })
  .superRefine((data: AvailabilityQuery, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const now = new Date();

    if (start < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startDate must be in the future",
        path: ["startDate"],
      });
    }

    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startDate must be before endDate",
        path: ["endDate"],
      });
    }
  });

// GET /availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/", async (req, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, carId } = availabilitySchema.parse(
      req.query,
    ) as AvailabilityQuery;

    const start = new Date(startDate),
      end = new Date(endDate);

    const list = await availabilityService.listAvailable(start, end);

    if (carId) {
      const car = list.find((c) => c.id === carId);
      if (!car) {
        res.status(404).json({ message: "Car not available" });
        return;
      }
      res.json([car]);
      return;
    }

    res.json(list);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.errors });
      return;
    } else if (err instanceof Error) {
      res.status(400).json({ errors: [{ message: err.message }] });
      return;
    }
    next(err);
  }
});

export default router;
