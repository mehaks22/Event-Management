import API from '../services/api';

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

export const getAllEvents = () => API.get<EventDTO[]>('/events');

export const getEventById = (id: string) => API.get<EventDTO>(`/events/${id}`);

export const createEvent = (eventData: CreateEventPayload, organizerId: string) =>
  API.post<EventDTO>('/events', eventData, { params: { organizerId } });

export const registerForEvent = (eventId: string) =>
  API.post<EventDTO>(`/events/${eventId}/register`);

export const unregisterFromEvent = (eventId: string) =>
  API.delete<void>(`/events/${eventId}/register`);

export const searchEvents = (query: string) =>
  API.get<EventDTO[]>('/events/search', { params: { query } });