import React from 'react';
import { MdDarkMode, MdLightMode, MdAutoMode } from 'react-icons/md';
import { useTheme } from '../hooks/useTheme';

/**
 * Quick theme toggle component that can be used in navigation bars or headers
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the toggle button ('sm', 'md', 'lg')
 * @param {string} props.variant - Style variant ('button', 'icon', 'dropdown')
 */
const ThemeToggle = ({ size = 'md', variant = 'button' }) => {
  const { theme, changeTheme, autoMode, toggleAutoMode, systemPreference } = useTheme();

  const sizeClasses = {
    sm: 'btn-sm text-lg',
    md: 'btn-md text-xl',
    lg: 'btn-lg text-2xl'
  };

  const iconSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const handleQuickToggle = () => {
    if (autoMode) {
      // If auto mode is on, turn it off and set to opposite of current system preference
      toggleAutoMode();
      const newTheme = systemPreference === 'dark' ? 'light' : 'dark';
      changeTheme(newTheme);
    } else {
      // If auto mode is off, toggle between light and dark
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      changeTheme(newTheme);
    }
  };

  const getCurrentIcon = () => {
    if (autoMode) {
      return <MdAutoMode className={iconSizeClasses[size]} />;
    }
    return theme === 'dark' ? 
      <MdDarkMode className={iconSizeClasses[size]} /> : 
      <MdLightMode className={iconSizeClasses[size]} />;
  };

  const getTooltipText = () => {
    if (autoMode) {
      return `Auto mode (${systemPreference})`;
    }
    return `${theme === 'dark' ? 'Dark' : 'Light'} mode`;
  };

  if (variant === 'icon') {
    return (
      <button
        className={`btn btn-ghost btn-circle ${sizeClasses[size]}`}
        onClick={handleQuickToggle}
        title={getTooltipText()}
        aria-label="Toggle theme"
      >
        {getCurrentIcon()}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className={`btn btn-ghost ${sizeClasses[size]}`}>
          {getCurrentIcon()}
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <button onClick={() => changeTheme('light')} className={theme === 'light' && !autoMode ? 'active' : ''}>
              <MdLightMode /> Light
            </button>
          </li>
          <li>
            <button onClick={() => changeTheme('dark')} className={theme === 'dark' && !autoMode ? 'active' : ''}>
              <MdDarkMode /> Dark
            </button>
          </li>
          <li>
            <button onClick={toggleAutoMode} className={autoMode ? 'active' : ''}>
              <MdAutoMode /> Auto ({systemPreference})
            </button>
          </li>
        </ul>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      className={`btn btn-ghost ${sizeClasses[size]} gap-2`}
      onClick={handleQuickToggle}
      title={getTooltipText()}
      aria-label="Toggle theme"
    >
      {getCurrentIcon()}
      <span className="hidden sm:inline">
        {autoMode ? 'Auto' : (theme === 'dark' ? 'Dark' : 'Light')}
      </span>
    </button>
  );
};

export default ThemeToggle;
