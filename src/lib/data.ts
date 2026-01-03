
import type { User, MenuItem, Table, Order, Offer, Note, CalendarEvent } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [
  { id: '1', name: 'Maria', username: 'Maria', role: 'admin' },
  { id: '2', name: 'Jhon', username: 'Jhon', role: 'waiter' },
  { id: '3', name: 'Camila', username: 'Camila', role: 'kitchen' },
];

export const menuItems: MenuItem[] = [];

export const offers: Offer[] = [];

export const tables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  status: 'free',
}));

export const initialOrders: Order[] = [];

export const initialNotes: Note[] = []

export const initialCalendarEvents: CalendarEvent[] = [];

