export interface Contact {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  numero: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  contact_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithContact extends Appointment {
  contact: Contact;
}
