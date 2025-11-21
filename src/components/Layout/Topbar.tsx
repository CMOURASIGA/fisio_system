import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, profile, signInWithGoogle, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex flex-1 items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 mr-4 text-gray-500 rounded-md md:hidden hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="relative hidden md:block w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Buscar pacientes, atendimentos..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
            <Bell className="h-6 w-6" />
          </button>
          
          <div className="relative flex items-center">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              {user ? (
                <>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="hidden md:block text-sm">
                    <p className="font-medium text-gray-700">{profile?.full_name ?? user.email}</p>
                    <p className="text-xs text-gray-500">{profile?.role ?? 'Usuário'}</p>
                  </div>
                  <button onClick={() => signOut()} className="ml-3 text-sm text-red-500">Sair</button>
                </>
              ) : (
                <button onClick={() => signInWithGoogle()} className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm">Entrar com Google</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;