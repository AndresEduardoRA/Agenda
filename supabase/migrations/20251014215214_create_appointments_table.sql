/*
  # Create appointments table for scheduling

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key) - Unique identifier for each appointment
      - `user_id` (uuid, foreign key) - References auth.users
      - `contact_id` (uuid, foreign key) - References contacts table
      - `title` (text) - Appointment title/subject
      - `description` (text) - Appointment details
      - `date` (date) - Appointment date
      - `time` (time) - Appointment time
      - `status` (text) - Status: pending, confirmed, cancelled, completed
      - `created_at` (timestamptz) - When appointment was created
      - `updated_at` (timestamptz) - When appointment was last updated
  
  2. Security
    - Enable RLS on `appointments` table
    - Add policies for authenticated users to manage their own appointments
    
  3. Indexes
    - Add index on user_id for faster queries
    - Add index on contact_id for faster lookups
    - Add index on date for calendar views
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  time time NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
