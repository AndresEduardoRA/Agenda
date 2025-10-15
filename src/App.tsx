import { useState, useEffect } from "react";
import { UserPlus, LogOut, BookOpen, Calendar } from "lucide-react";
import { supabase } from "./lib/supabase";
import { Contact, Appointment, AppointmentWithContact } from "./types";
import { ContactForm } from "./components/ContactForm";
import { ContactList } from "./components/ContactList";
import { AppointmentForm } from "./components/AppointmentForm";
import { AppointmentList } from "./components/AppointmentList";
import { AuthModal } from "./components/AuthModal";
import { User } from "@supabase/supabase-js";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithContact[]>(
    []
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"contacts" | "appointments">(
    "contacts"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadContacts();
      loadAppointments();
    } else {
      setContacts([]);
      setAppointments([]);
    }
  }, [user]);

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error loading contacts:", error);
    } else {
      setContacts(data || []);
    }
  };

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        contact:contacts(*)
      `
      )
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error("Error loading appointments:", error);
    } else {
      setAppointments((data as AppointmentWithContact[]) || []);
    }
  };

  const handleAuth = async (
    email: string,
    password: string,
    isLogin: boolean
  ) => {
    try {
      if (isLogin) {
        console.log(email, password);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        console.log(email, password);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      setShowAuthModal(false);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveContact = async (contactData: {
    nombre: string;
    apellido: string;
    numero: string;
    email: string;
  }) => {
    try {
      if (editingContact) {
        const { error } = await supabase
          .from("contacts")
          .update({ ...contactData, updated_at: new Date().toISOString() })
          .eq("id", editingContact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert([{ ...contactData, user_id: user?.id }]);

        if (error) throw error;
      }

      await loadContacts();
      setShowContactForm(false);
      setEditingContact(null);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
      try {
        const { error } = await supabase.from("contacts").delete().eq("id", id);

        if (error) throw error;
        await loadContacts();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      }
    }
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setShowContactForm(true);
  };

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleSaveAppointment = async (appointmentData: {
    contact_id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    status: string;
  }) => {
    try {
      if (editingAppointment) {
        const { error } = await supabase
          .from("appointments")
          .update({ ...appointmentData, updated_at: new Date().toISOString() })
          .eq("id", editingAppointment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("appointments")
          .insert([{ ...appointmentData, user_id: user?.id }]);

        if (error) throw error;
      }

      await loadAppointments();
      setShowAppointmentForm(false);
      setEditingAppointment(null);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleEditAppointment = (appointment: AppointmentWithContact) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta cita?")) {
      try {
        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", id);

        if (error) throw error;
        await loadAppointments();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <BookOpen size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mi Agenda</h1>
          <p className="text-gray-600 mb-8">
            Gestiona tus contactos de forma fácil y segura
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Comenzar
          </button>
        </div>
        {showAuthModal && (
          <AuthModal
            onAuth={handleAuth}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mi Agenda</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={
                  activeTab === "contacts" ? handleAddNew : handleAddAppointment
                }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {activeTab === "contacts" ? (
                  <>
                    <UserPlus size={20} />
                    Agregar Contacto
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    Agendar Cita
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <LogOut size={20} />
                Salir
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("contacts")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "contacts"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus size={18} />
                  Contactos ({contacts.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "appointments"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={18} />
                  Citas ({appointments.length})
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "contacts" ? (
              <ContactList
                contacts={contacts}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            ) : (
              <AppointmentList
                appointments={appointments}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
              />
            )}
          </div>
        </div>
      </div>

      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={() => {
            setShowContactForm(false);
            setEditingContact(null);
          }}
        />
      )}

      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          contacts={contacts}
          onSave={handleSaveAppointment}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
