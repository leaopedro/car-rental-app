import { Router, NextFunction, Response } from "express";
import { z } from "zod";
import bookingService from "../services/bookingService";
import { BookingDTO } from "../models/types";

const router = Router();

const dateString = z
  .string()
  .refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date format" });

const bookingSchema = z
  .object({
    userId: z.string().uuid(),
    carId: z.string().uuid(),
    startDate: dateString,
    endDate: dateString,
  })
  .superRefine((data, ctx) => {
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

type BookingBody = z.infer<typeof bookingSchema>;

router.post("/", async (req, res: Response, next: NextFunction) => {
  try {
    const parsed = bookingSchema.parse(req.body) as BookingBody;

    const bookingReq: BookingDTO = {
      userId: parsed.userId,
      carId: parsed.carId,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
    };

    const booking = await bookingService.createBooking(bookingReq);
    res.status(201).json(booking);
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
