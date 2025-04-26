import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import { BookingProvider } from "./context/BookingContext";

export default function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <nav id="home-navbar">
          <img src="/carental-logo.png" className="h-25 object-cover" />
        </nav>
        <div
          id="home-bg"
          className="w-full h-[75vh] sm:h-[50vh] md:h-[45vh]  pt-15 sm:pt-20 md:pt-30 bg-cover bg-center bg-no-repeat"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
          </Routes>
        </div>
      </BookingProvider>
    </BrowserRouter>
  );
}
