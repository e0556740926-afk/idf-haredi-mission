import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { t } from '../i18n/he';

const ITEMS = [
  { to: '/today', icon: 'today', label: t.nav.today },
  { to: '/flow', icon: 'flow', label: t.nav.flow },
  { to: '/activity', icon: 'activity', label: t.nav.activity },
  { to: '/home', icon: 'home', label: t.nav.home },
  { to: '/ritual', icon: 'ritual', label: t.nav.ritual },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 h-[70px] bg-white border-t border-line flex justify-around px-[5px] pt-[10px] pb-3 z-10"
      aria-label={t.nav.activity}
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `w-16 text-[11px] grid justify-items-center gap-[5px] ${isActive ? 'text-blue' : 'text-weak'}`
          }
        >
          <Icon name={item.icon} className="w-5 h-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
