/*
  # Create contacts table for agenda application

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key) - Unique identifier for each contact
      - `user_id` (uuid, foreign key) - Links contact to authenticated user
      - `nombre` (text, not null) - First name of the contact
      - `apellido` (text, not null) - Last name of the contact
      - `numero` (text, not null) - Phone number
      - `email` (text, not null) - Email address
      - `created_at` (timestamptz) - Timestamp when contact was created
      - `updated_at` (timestamptz) - Timestamp when contact was last updated

  2. Security
    - Enable RLS on `contacts` table
    - Add policy for authenticated users to view only their own contacts
    - Add policy for authenticated users to insert their own contacts
    - Add policy for authenticated users to update their own contacts
    - Add policy for authenticated users to delete their own contacts

  3. Important Notes
    - Each user can only access their own contacts
    - All operations require authentication
    - Contacts are linked to users via user_id
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  numero text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_nombre_idx ON contacts(nombre);
CREATE INDEX IF NOT EXISTS contacts_apellido_idx ON contacts(apellido);