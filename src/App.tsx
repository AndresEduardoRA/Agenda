import { useState, useEffect } from 'react';
import { UserPlus, LogOut, BookOpen } from 'lucide-react';
import { supabase, Contact } from './lib/supabase';
import { ContactForm } from './components/ContactForm';
import { ContactList } from './components/ContactList';
import { AuthModal } from './components/AuthModal';

function App() {
  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
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
    } else {
      setContacts([]);
    }
  }, [user]);

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error loading contacts:', error);
    } else {
      setContacts(data || []);
    }
  };

  const handleAuth = async (email: string, password: string, isLogin: boolean) => {
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      setShowAuthModal(false);
    } catch (error: any) {
      alert(error.message);
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
          .from('contacts')
          .update({ ...contactData, updated_at: new Date().toISOString() })
          .eq('id', editingContact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([{ ...contactData, user_id: user.id }]);

        if (error) throw error;
      }

      await loadContacts();
      setShowContactForm(false);
      setEditingContact(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este contacto?')) {
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', id);

        if (error) throw error;
        await loadContacts();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setShowContactForm(true);
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
          <p className="text-gray-600 mb-8">Gestiona tus contactos de forma fácil y segura</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Comenzar
          </button>
        </div>
        {showAuthModal && (
          <AuthModal onAuth={handleAuth} onClose={() => setShowAuthModal(false)} />
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
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={20} />
                Agregar Contacto
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Contactos ({contacts.length})
          </h2>
          <ContactList
            contacts={contacts}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
          />
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
    </div>
  );
}

export default App;
