import { Car } from "../models/types";
import { v4 as uuidv4 } from "uuid";

export const initialCars: Car[] = [
  {
    id: uuidv4(),
    brand: "Toyota",
    model: "Yaris",
    imageURL:
      "https://media.toyota.com.br/026e13b1-ed3c-4011-b76f-4a7effc2b9fc.png",
    pricing: [
      { season: "peak", pricePerDay: 98.43 },
      { season: "mid", pricePerDay: 76.89 },
      { season: "off", pricePerDay: 53.65 },
    ],
  },
  {
    id: uuidv4(),
    brand: "Seat",
    model: "Ibiza",
    imageURL:
      "https://www.seat.com/content/dam/public/seat-website/carworlds/new-cw-ibiza/overview/version-view/ibiza-reference/seat-ibiza-reference-colour-candy-white.png",
    pricing: [
      { season: "peak", pricePerDay: 85.12 },
      { season: "mid", pricePerDay: 65.73 },
      { season: "off", pricePerDay: 46.85 },
    ],
  },
  {
    id: uuidv4(),
    brand: "Nissan",
    model: "Qashqai",
    imageURL:
      "https://caetanoretail.pt/site/uploads/sites/23/2024/05/nissan-qashqai-2024.webp",
    pricing: [
      { season: "peak", pricePerDay: 101.46 },
      { season: "mid", pricePerDay: 82.94 },
      { season: "off", pricePerDay: 59.87 },
    ],
  },
  {
    id: uuidv4(),
    brand: "Jaguar",
    model: "e-pace",
    imageURL:
      "https://alcf.s3.us-west-1.amazonaws.com/_custom/2024/jaguar/e-pace/15255_st1280_089.png",
    pricing: [
      { season: "peak", pricePerDay: 120.54 },
      { season: "mid", pricePerDay: 91.35 },
      { season: "off", pricePerDay: 70.27 },
    ],
  },
  {
    id: uuidv4(),
    brand: "Mercedes",
    model: "Vito",
    imageURL:
      "https://www.webmotors.com.br/tabela-fipe/_next/image?url=https%3A%2F%2Fwww.webmotors.com.br%2Fimagens%2Fprod%2F346448%2FMERCEDESBENZ_VITO_2.0_16V_CGI_FLEX_TOURER_119_LUXO_7PLUS1_MANUAL_34644820592972358.png&w=768&q=75",
    pricing: [
      { season: "peak", pricePerDay: 109.16 },
      { season: "mid", pricePerDay: 89.64 },
      { season: "off", pricePerDay: 64.97 },
    ],
  },
];
