import { AvailableCar } from "../types";

interface CarCardProps {
  car: AvailableCar;
  onClick: (car: AvailableCar) => void;
}

export default function CarCard({ car, onClick }: CarCardProps) {
  const total = car.totalPrice ?? 0;
  const average = car.averageDailyPrice ?? 0;

  return (
    <div
      className="bg-white text-zinc-950 rounded-lg shadow overflow-hidden cursor-pointer shadow-sm hover:shadow-lg flex flex-col"
      onClick={() => onClick(car)}
    >
      <img
        src={car.imageURL}
        alt={`${car.brand} ${car.model}`}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h2 className="text-xl font-bold mb-2">
          {car.brand} {car.model}
        </h2>
        <div className="mt-4">
          <p className="text-gray-800">Total: ${total.toFixed(2)}</p>
          <p className="text-xs text-gray-600">
            Avg / day: ${average.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="p-4 flex justify-end">
        <button className="outline outline-sky-500 text-sky-500 px-4 py-2 rounded">
          Book Now
        </button>
      </div>
    </div>
  );
}
