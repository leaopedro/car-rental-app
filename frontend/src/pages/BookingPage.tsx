import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, createBooking, fetchCarPricing } from "../api";
import { BookingDTO } from "../types";
import BookingSuccess from "../components/BookingSuccess";
import { useBooking } from "../context/BookingContext";
import Input from "../components/Input";

export default function BookingPage() {
  const {
    car,
    startDate,
    endDate,
    quoteFetched,
    totalPrice,
    averageDailyPrice,
    updateDates,
    updateQuote,
    clearBooking,
  } = useBooking();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [licenseDate, setLicenseDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // redirect if no car selected
  useEffect(() => {
    if (!car) {
      navigate("/");
    }
  }, [car, navigate]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as {
          email: string;
          drivingLicenseValidUntil: string;
        };
        setEmail(user.email);
        setLicenseDate(user.drivingLicenseValidUntil.split("T")[0]);
      } catch {
        console.error("Invalid user data in localStorage.");
      }
    }
  }, []);

  const handleGetQuote = async () => {
    setError("");

    if (new Date(endDate) <= new Date(startDate)) {
      setError("Drop-off must be after pick-up.");
      return;
    }

    try {
      const pricing = await fetchCarPricing(startDate, endDate, car!.id);
      if (pricing?.[0]) {
        updateQuote(pricing[0].totalPrice, pricing[0].averageDailyPrice);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch quote.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!quoteFetched) {
      setError("Please fetch a quote before booking.");
      return;
    }
    if (!email || !licenseDate) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const user = await createUser({
        email,
        drivingLicenseValidUntil: licenseDate,
      });
      localStorage.setItem("user", JSON.stringify(user));

      const booking: BookingDTO = {
        userId: user.id,
        carId: car!.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
      await createBooking(booking);

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    clearBooking();
    navigate("/");
  };

  if (!car) return null;

  if (success) {
    return <BookingSuccess onBack={handleBack} />;
  }

  return (
    <div className="flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Confirm Your Booking</h2>

        <img
          src={car.imageURL}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-45 object-cover rounded mb-4"
        />

        <p className="text-xl font-medium mb-2">
          {car.brand} {car.model}
        </p>

        <div className="flex flex-col sm:flex-row space-y-4  text-gray-700 sm:space-x-4 mb-4">
          <Input
            label="Pick-up"
            type="date"
            value={startDate}
            onChange={(date) => updateDates(date, endDate)}
            onBlur={handleGetQuote}
            id="startDate"
          />
          <Input
            label="Drop-off"
            type="date"
            value={endDate}
            onChange={(date: string) => updateDates(startDate, date)}
            onBlur={handleGetQuote}
            id="endDate"
          />
        </div>

        <p className="mb-6">
          <span className="font-medium">Total:</span> ${totalPrice.toFixed(2)}{" "}
          <span className="text-sm text-gray-600">
            (${averageDailyPrice.toFixed(2)}/day)
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <Input
            label="License valid until"
            id="licenseDate"
            type="date"
            value={licenseDate}
            onChange={setLicenseDate}
          />

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !quoteFetched}
            className="w-full bg-sky-500 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="w-full outline outline-sky-500 text-sky-500 rounded px-4 py-2"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}
