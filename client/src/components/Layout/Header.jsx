import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';

const Header = ({ onSearch, toggleSidebar, loading }) => {
      const [inputValue, setInputValue] = useState('');

      const handleSubmit = (e) => {
            e.preventDefault();
            onSearch(inputValue);
      };

      return (
            <header className="header-bar" style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 100,
                  background: 'rgba(10, 14, 39, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(79, 70, 229, 0.2)',
                  padding: '1rem 2rem'
            }}>
                  <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                              <button className="btn-icon" onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                    <Menu size={24} />
                              </button>

                              <form onSubmit={handleSubmit} className="search-container" style={{ position: 'relative' }}>
                                    <Search className="search-icon" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                          type="text"
                                          className="search-input"
                                          placeholder="Enter ticker (e.g., AAPL)..."
                                          value={inputValue}
                                          onChange={(e) => setInputValue(e.target.value)}
                                          style={{
                                                padding: '0.75rem 1rem 0.75rem 3rem',
                                                borderRadius: '9999px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'white',
                                                width: '300px'
                                          }}
                                    />
                              </form>
                        </div>

                        <div className="flex items-center gap-4">
                              <div className="btn-group">
                                    <button className="btn btn-sm btn-secondary" onClick={() => onSearch('AAPL')}>AAPL</button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => onSearch('NVDA')}>NVDA</button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => onSearch('MSFT')}>MSFT</button>
                              </div>
                              {loading && <div className="loading-spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>}
                        </div>
                  </div>
            </header>
      );
};

export default Header;
