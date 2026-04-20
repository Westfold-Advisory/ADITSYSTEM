// src/types.ts

export default interface Lugar {
  id: number;
  nombre: string;
  label: string;
  category: string;
  coords: [number, number];
  info: string;
  rating: string;
  reviews: number;
  hours: string;
  image: string; // URL externa o base64
  cvUrl?: string; // URL de CV / currículum (opcional)
  celular?: string; // Número WhatsApp sin + ni espacios (opcional)
}
