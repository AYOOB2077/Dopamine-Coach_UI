import './layout.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconHome,
  IconEdit,
  IconCal,
  IconClip,
  IconMoon,
  IconSignOut,
  Wordmark
} from './../shared/Icons';

export interface SidebarProps {
  tab: string;
  onTab?: (id: string) => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export function Sidebar({ tab, onTab, darkMode = false, onToggleDark }: SidebarProps) {
  const navigate = useNavigate();
  const items = [
    { id: 'coach',    path: '/coach',    label: 'Coach',           Icon: IconHome },
    { id: 'ongoing',  path: '/ongoing',  label: 'Ongoing',         Icon: IconEdit },
    { id: 'upcoming', path: '/upcoming', label: 'Upcoming Events', Icon: IconCal },
    { id: 'finished', path: '/finished', label: 'Finished Tasks',  Icon: IconClip },
  ];

  const handleTabClick = (id: string, path: string) => {
    if (onTab) onTab(id);
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <Wordmark />
      <nav className="nav">
        {items.map(({ id, path, label, Icon: I }) => (
          <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => handleTabClick(id, path)}>
            <I /> {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-foot">
        {/* Night Mode toggle */}
        <button
          className={`night-mode-btn ${darkMode ? 'active' : ''}`}
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to night mode'}
          aria-pressed={darkMode}
        >
          <IconMoon />
          <span className="night-mode-label">Night Mode</span>
          {/* Animated pill toggle */}
          <div className={`toggle-pill ${darkMode ? 'on' : ''}`}>
            <div className="toggle-pill-thumb" />
          </div>
        </button>
        <button className="signout" onClick={() => navigate('/settings')}>
          <IconEdit /> Settings
        </button>
      </div>
    </aside>
  );
}
