import { createContext, useContext, useState, ReactNode } from "react";
import { AvailableCar } from "../types";

interface BookingData {
  car: AvailableCar | null;
  startDate: string;
  endDate: string;
  quoteFetched: boolean;
  totalPrice: number;
  averageDailyPrice: number;
}

interface BookingContextType extends BookingData {
  setBooking: (data: {
    car: AvailableCar;
    startDate: string;
    endDate: string;
  }) => void;
  updateDates: (start: string, end: string) => void;
  updateQuote: (total: number, avg: number) => void;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBookingState] = useState<BookingData>({
    car: null,
    startDate: "",
    endDate: "",
    quoteFetched: false,
    totalPrice: 0,
    averageDailyPrice: 0,
  });

  const setBooking = ({
    car,
    startDate,
    endDate,
  }: {
    car: AvailableCar;
    startDate: string;
    endDate: string;
  }) => {
    setBookingState({
      car,
      startDate,
      endDate,
      quoteFetched: true,
      totalPrice: car.totalPrice ?? 0,
      averageDailyPrice: car.averageDailyPrice ?? 0,
    });
  };

  const updateDates = (start: string, end: string) => {
    setBookingState((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      quoteFetched: false,
    }));
  };

  const updateQuote = (total: number, avg: number) => {
    setBookingState((prev) => ({
      ...prev,
      totalPrice: total,
      averageDailyPrice: avg,
      quoteFetched: true,
    }));
  };

  const clearBooking = () => {
    setBookingState({
      car: null,
      startDate: "",
      endDate: "",
      quoteFetched: false,
      totalPrice: 0,
      averageDailyPrice: 0,
    });
  };

  const value: BookingContextType = {
    ...booking,
    setBooking,
    updateDates,
    updateQuote,
    clearBooking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
