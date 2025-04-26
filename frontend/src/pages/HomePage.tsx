import { useState, FormEvent, useEffect } from "react";
import { AvailableCar } from "../types";
import { fetchAvailability } from "../api";
import CarCard from "../components/CarCard";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function HomePage() {
  const { setBooking, clearBooking } = useBooking();
  const navigate = useNavigate();

  // default to tomorrow / day after
  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(formatDate(tomorrow));
  const [endDate, setEndDate] = useState(formatDate(dayAfter));
  const [cars, setCars] = useState<AvailableCar[] | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCars(null);

    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }

    try {
      const data = await fetchAvailability(startDate, endDate);
      setCars(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    }
  }

  function handleCarClick(car: AvailableCar) {
    if (!car || !car.id) return;
    setBooking({ car, startDate, endDate });
    navigate("/booking");
  }

  useEffect(() => {
    clearBooking();
  }, []);

  return (
    <div className="container flex flex-col items-center mx-auto p-6 text-white">
      <div className="w-full max-w-[800px] text-left">
        <h1 className="text-3xl self-start font-semibold mb-2">
          Your Journey Starts Here
        </h1>
        <p className="text-lg font-light mb-6">
          Compare hundreds of models and book in under 60 seconds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[800px] flex-col sm:flex-row md:items-end md:space-x-4 space-y-4 sm:space-x-4 mb-8"
      >
        <Input
          label="Pick-up"
          type="date"
          dark={true}
          value={startDate}
          onChange={(date) => setStartDate(date)}
          id="startDate"
        />
        <Input
          label="Drop-off"
          type="date"
          dark={true}
          value={endDate}
          onChange={(date: string) => setEndDate(date)}
          id="endDate"
        />
        <button
          type="submit"
          className="bg-sky-500 text-white w-full sm:w-auto self-center mt-3 rounded px-6 py-2 hover:bg-sky-600 transition"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 mb-6 text-center">{error}</p>}

      {cars && cars.length === 0 && (
        <p className="text-red-600 my-6 text-center">No cars available.</p>
      )}

      {cars && cars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px]">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} onClick={handleCarClick} />
          ))}
        </div>
      )}
    </div>
  );
}
