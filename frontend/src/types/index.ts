export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  role?: string;
  expiresIn?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  eventDate: string;
  capacity: number;
  attendeeCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  capacity: number;
  attendeeCount: number;
  eventDate: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  category: string;
  capacity: number;
  eventDate: string;
}