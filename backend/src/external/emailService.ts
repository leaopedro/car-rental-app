import { Resend } from "resend";
import { Car, User } from "../models/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(
  user: User,
  car: Car,
  bookingId: string,
  startDate: Date,
  endDate: Date,
  totalPrice: number,
) {
  if (!Boolean(process.env.SEND_CONFIRMATION_EMAIL)) {
    console.info("[EmailService] Emails not enabled");
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: [user.email],
    subject: "Your Carental Booking Confirmation",
    html: `
      <h1>Booking Confirmed 🎉</h1>
      <p>Hello,</p>

      <p>Thank you for booking! Here is your booking details:</p>

      <ul>
        <li><strong>Car:</strong> ${car.brand} ${car.model}</li>
        <li><strong>Pick-up Date:</strong> ${startDate.toDateString()}</li>
        <li><strong>Drop-off Date:</strong> ${endDate.toDateString()}</li>
        <li><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</li>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
      </ul>

      <p>— The Carental Team</p>
    `,
  });

  console.log(`[EmailService] Sent booking confirmation to ${user.email}`);
}
