import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Calendar, 
  FileText, 
  Settings, 
  UserCog,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItemProps {
  item: {
    name: string;
    path: string;
    icon: any;
  };
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg mb-1 transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <item.icon className="mr-3 h-5 w-5" />
    {item.name}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', path: '/pacientes', icon: Users },
    { name: 'Atendimentos', path: '/atendimentos', icon: ClipboardList },
    { name: 'Relatórios', path: '/relatorios', icon: FileText },
  ];

  const managementLinks = [
    { name: 'Profissionais', path: '/profissionais', icon: UserCog },
    { name: 'Agenda', path: '/agenda', icon: Calendar },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  const handleItemClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-gray-600 bg-opacity-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <Activity className="h-8 w-8 text-primary-600 mr-3" />
          <span className="text-xl font-bold text-gray-800">Fisio System</span>
        </div>

        <div className="px-4 py-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Menu Principal
            </h3>
            <nav>
              {links.map((link) => (
                <NavItem key={link.path} item={link} onClick={handleItemClick} />
              ))}
            </nav>
          </div>

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Gestão
            </h3>
            <nav>
              {managementLinks.map((link) => (
                <NavItem key={link.path} item={link} onClick={handleItemClick} />
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;