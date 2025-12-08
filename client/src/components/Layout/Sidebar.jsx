import React from 'react';
import { LayoutDashboard, DollarSign, TrendingUp, Users, Target, Activity, Menu } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
      const menuItems = [
            { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '#overview' },
            { icon: <DollarSign size={20} />, label: 'Revenue', href: '#revenue' },
            { icon: <TrendingUp size={20} />, label: 'Financials', href: '#financials' },
            { icon: <Users size={20} />, label: 'Management', href: '#management' },
            { icon: <Target size={20} />, label: 'Competitive', href: '#competitive' },
            { icon: <Activity size={20} />, label: 'Sentiment', href: '#sentiment' },
      ];

      return (
            <nav className={`sidebar ${!isOpen ? 'closed' : ''}`} style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s' }}>
                  <div className="sidebar-header">
                        <a href="#" className="sidebar-brand">
                              <span className="brand-icon">📊</span>
                              <span className="brand-text">AI Analysis</span>
                        </a>
                  </div>
                  <ul className="sidebar-menu">
                        {menuItems.map((item, index) => (
                              <li key={index}>
                                    <a href={item.href} className="sidebar-link">
                                          <span className="link-icon">{item.icon}</span>
                                          <span className="link-text">{item.label}</span>
                                    </a>
                              </li>
                        ))}
                  </ul>
            </nav>
      );
};

export default Sidebar;
