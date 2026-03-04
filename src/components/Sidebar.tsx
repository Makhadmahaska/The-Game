import { NavLink } from 'react-router-dom';

const links = [
  { to: '/register', label: 'Register' },
  { to: '/users', label: 'All Users' },
  { to: '/choose-game', label: 'Choose Game' },
  { to: '/timer', label: 'Game Timer' },
  { to: '/statistics', label: 'User Statistics' }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h1>Game Time Tracker</h1>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
