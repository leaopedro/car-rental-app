import { Router, NextFunction, Response } from "express";
import { z } from "zod";
import userService from "../services/userService";
import { CreateUserDTO } from "../models/types";

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  drivingLicenseValidUntil: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid date format",
  }),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

router.post("/", async (req, res: Response, next: NextFunction) => {
  try {
    const parsed = createUserSchema.parse(req.body) as CreateUserInput;
    const dto: CreateUserDTO = {
      email: parsed.email,
      drivingLicenseValidUntil: new Date(parsed.drivingLicenseValidUntil),
    };
    const user = await userService.createUser(dto);
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    next(err);
  }
});

export default router;
