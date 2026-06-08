import { NavLink } from 'react-router-dom';
import { Dumbbell, BookOpen, BarChart2, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/ProfileSelect';

const links = [
  { to: '/',         icon: Dumbbell,  label: 'Сегодня' },
  { to: '/library',  icon: BookOpen,  label: 'Библиотека' },
  { to: '/stats',    icon: BarChart2, label: 'Прогресс' },
  { to: '/ai-plan',  icon: Sparkles,  label: 'AI план' },
  { to: '/settings', icon: Settings,  label: 'Настройки' },
];

export default function NavBar() {
  const { activeProfile } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {to === '/settings' && activeProfile ? (
                  <div className={`rounded-full transition-all ${isActive ? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}`}>
                    <ProfileAvatar profile={activeProfile} size={22} textSize="text-[11px]" />
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
