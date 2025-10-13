import { useState } from 'react';
import { Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { Contact } from '../lib/supabase';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

type SortField = 'nombre' | 'apellido' | 'email';
type SortOrder = 'asc' | 'desc';

export function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredAndSortedContacts = contacts
    .filter((contact) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        contact.nombre.toLowerCase().includes(searchLower) ||
        contact.apellido.toLowerCase().includes(searchLower) ||
        contact.numero.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleSort('nombre')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowUpDown size={16} />
          Nombre {sortField === 'nombre' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('apellido')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowUpDown size={16} />
          Apellido {sortField === 'apellido' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('email')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowUpDown size={16} />
          Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {filteredAndSortedContacts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'No se encontraron contactos' : 'No hay contactos aún'}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredAndSortedContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {contact.nombre} {contact.apellido}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Teléfono:</span>
                      <span>{contact.numero}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span>{contact.email}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEdit(contact)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Modificar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
