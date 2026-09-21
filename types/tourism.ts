export type Currency = 'USD' | 'LKR';

export interface TourPackage {
  id: string;
  title: string;
  tagline: string;
  duration: string;
  highlights: string[];
  priceUSD: number;
  priceLKR: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: 'All' | 'Cultural' | 'Wildlife' | 'Coastal' | 'Hill Country' | 'Signature';
  featured?: boolean;
  locations: string[];
  itinerary: { day: number; title: string; desc: string }[];
  minGuests?: number;
  maxGuests?: number | null;
  guestPolicy?: 'solo' | 'couple' | 'family' | 'custom' | string;
}

export interface Destination {
  id: string;
  name: string;
  district: string;
  tag: string;
  description: string;
  image: string;
  highlights: string[];
  bestTimeToVisit: string;
  bentoSpan: string;
}

export interface Experience {
  id: string;
  title: string;
  duration: string;
  category: string;
  priceUSD: number;
  priceLKR: number;
  image: string;
  description: string;
  location: string;
}

export interface FleetVehicle {
  id: string;
  name: string;
  category: 'Sedans' | 'Vans' | 'Mini Buses';
  passengers: string;
  luggage: string;
  features: string[];
  image: string;
  pricePerDayUSD: number;
  pricePerDayLKR: number;
  recommendedFor: string;
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  flag: string;
  avatar: string;
  rating: number;
  tourTaken: string;
  quote: string;
  date: string;
}

export interface PromoBannerData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  discount: string;
  validUntil: string;
  ctaText: string;
  code: string;
}

export interface BookingState {
  step: number;
  destination: string;
  packageId: string;
  startDate: string;
  duration: string;
  guests: number;
  vehicleId: string;
  selectedExperiences: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
}
