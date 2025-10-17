import React, { useState, useEffect, useMemo } from 'react';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
}

export interface InteractiveMenuProps {
  items: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
  onItemClick?: (index: number) => void;
}

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  activeIndex: controlledActiveIndex,
  onItemClick
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);

  // Use controlled activeIndex if provided, otherwise use internal state
  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;

  // Reset internal state if it exceeds item count
  useEffect(() => {
    if (internalActiveIndex >= items.length) {
      setInternalActiveIndex(0);
    }
  }, [items.length, internalActiveIndex]);

  const handleItemClick = (index: number) => {
    // Call the provided callback if it exists
    if (onItemClick) {
      onItemClick(index);
    }

    // Only update internal state if not controlled
    if (controlledActiveIndex === undefined) {
      setInternalActiveIndex(index);
    }
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav
      className="menu"
      role="navigation"
      style={navStyle}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;

        return (
          <button
            key={item.label}
            className={`menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu }
