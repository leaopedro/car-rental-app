interface BookingSuccessProps {
  onBack: () => void;
}

export default function BookingSuccess({ onBack }: BookingSuccessProps) {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-left">
        <h1 className="text-2xl font-semibold mb-4">Booked!</h1>
        <p className="text-gray-600 mb-4">Check your email for details.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 w-full outline outline-sky-500 text-sky-500 rounded px-4 py-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
