export type UserRole = 'USER' | 'ADMIN';

export interface UserDTO {
  id: number;
  email: string;
  role: UserRole;
}

export interface EventDTO {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string;
  max_seats: number;
  booked_seats: number;
  available_seats: number;
}

export interface ReservationDTO {
  id: number;
  event_id: number;
  title: string;
  date: string;
  location: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  role: UserRole;
}