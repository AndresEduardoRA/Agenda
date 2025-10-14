import { Pencil, Trash2, Calendar, Clock, User } from 'lucide-react';
import { AppointmentWithContact } from '../types';

interface AppointmentListProps {
  appointments: AppointmentWithContact[];
  onEdit: (appointment: AppointmentWithContact) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

export function AppointmentList({ appointments, onEdit, onDelete }: AppointmentListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay citas agendadas
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {appointment.title}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
                      statusColors[appointment.status]
                    }`}
                  >
                    {statusLabels[appointment.status]}
                  </span>
                </div>
              </div>

              {appointment.description && (
                <p className="text-sm text-gray-600 mb-3">{appointment.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">
                    {appointment.contact.nombre} {appointment.contact.apellido}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>{formatTime(appointment.time)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(appointment)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Modificar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => onDelete(appointment.id)}
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
  );
}
