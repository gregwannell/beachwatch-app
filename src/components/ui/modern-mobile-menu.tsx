import React, { useState } from 'react';
import { Home, Map, Menu, LucideIcon } from 'lucide-react';

// Navigation item configuration
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Component props interfaces
interface NavItemProps {
  id: string;
  label: string;
  Icon: LucideIcon;
  activeTab: string;
  onClick: (id: string) => void;
}

export interface BottomNavBarProps {
  /** Initial active tab ID */
  defaultTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Side navigation items (default: Home and Settings) */
  sideItems?: [NavigationItem, NavigationItem];
  /** Central button configuration */
  centralButton?: {
    id: string;
    label: string;
    icon: LucideIcon;
  };
}

const NavItem: React.FC<NavItemProps> = ({
  id,
  label,
  Icon,
  activeTab,
  onClick
}) => {
    const isActive = activeTab === id;

    return (
        <button
            onClick={() => onClick(id)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center w-24 h-full transition-colors duration-300 focus:outline-none"
        >
            <div
                className="w-8 h-1 rounded-full transition-colors duration-300"
                style={{
                    backgroundColor: isActive ? 'var(--mcs-teal)' : 'transparent'
                }}
            />
            <Icon
                className="h-6 w-6 my-1 transition-colors duration-300"
                style={{
                    color: isActive ? 'var(--mcs-teal)' : '#9ca3af'
                }}
                strokeWidth={isActive ? 2.5 : 2}
            />
            <span
                className="text-xs font-medium transition-colors duration-300"
                style={{
                    color: isActive ? 'var(--mcs-teal)' : '#6b7280'
                }}
            >
                {label}
            </span>
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  defaultTab = 'home',
  onTabChange,
  sideItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'settings', label: 'Settings', icon: Menu }
  ],
  centralButton = { id: 'explore', label: 'Explore', icon: Map }
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    // Don't update active state for modal items like settings
    if (tabId !== 'settings') {
      setActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 z-[1050]" role="navigation" aria-label="Main navigation">
        <div className="relative w-full h-full">
            {/* Background Bar */}
            <div
              className="absolute bottom-0 left-0 w-full h-[72px] bg-white dark:bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
              aria-hidden="true"
            />

            {/* Central Prominent Button */}
            <button
              onClick={() => handleTabChange(centralButton.id)}
              aria-label={centralButton.label}
              aria-current={activeTab === centralButton.id ? 'page' : undefined}
              className="absolute left-1/2 -translate-x-1/2 top-1 w-14 h-14 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 z-10"
              style={{
                backgroundColor: 'var(--mcs-teal)',
                ['--tw-ring-color']: 'var(--mcs-teal)'
              } as React.CSSProperties}
            >
              <centralButton.icon className="h-7 w-7" />
            </button>

            {/* Navigation Items Container */}
            <div className="absolute top-0 left-0 w-full h-full flex justify-around items-center pt-1">
                <NavItem
                    id={sideItems[0].id}
                    label={sideItems[0].label}
                    Icon={sideItems[0].icon}
                    activeTab={activeTab}
                    onClick={handleTabChange}
                />

                {/* Placeholder for central button space */}
                <div className="w-24" aria-hidden="true" />

                <NavItem
                    id={sideItems[1].id}
                    label={sideItems[1].label}
                    Icon={sideItems[1].icon}
                    activeTab={activeTab}
                    onClick={handleTabChange}
                />
            </div>
        </div>
    </nav>
  );
};

export { BottomNavBar };
export default BottomNavBar;
