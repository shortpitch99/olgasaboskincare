import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiSearch, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(232, 180, 184, 0.2);
  padding: 0.8rem 0;
  transition: all 0.3s ease;
  
  @media (max-width: 1100px) {
    padding: 0.6rem 0;
  }
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  
  @media (max-width: 1200px) {
    max-width: 100%;
    padding: 0 0.5rem;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  img {
    height: 45px;
    width: auto;
    transition: opacity 0.3s ease;
    
    @media (max-width: 1100px) {
      height: 40px;
    }
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  justify-content: center;
  max-width: 800px;
  
  @media (max-width: 1100px) {
    gap: 1rem;
  }
  
  @media (max-width: 950px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    gap: 1rem;
    z-index: 1000;
    border-top: 1px solid rgba(232, 180, 184, 0.2);
    
    .mobile-only {
      display: block !important;
    }
  }
`;

const NavLink = styled(Link)`
  color: #c2185b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  white-space: nowrap;
  font-size: 0.95rem;
  
  @media (max-width: 1100px) {
    font-size: 0.9rem;
  }
  
  &:hover {
    color: #e879a6;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 1100px) {
    gap: 0.5rem;
  }
`;

const CartButton = styled(Link)`
  position: relative;
  color: #c2185b;
  font-size: 1.2rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #e879a6;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: #c2185b;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    color: #e879a6;
    background: rgba(232, 121, 166, 0.1);
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: #c2185b;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    color: #e879a6;
    background: rgba(232, 121, 166, 0.1);
  }
`;

const SearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
`;

const SearchModal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
`;

const SearchHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(232, 121, 166, 0.1);
  position: relative;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  border: 2px solid rgba(232, 121, 166, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem 0.75rem 3rem;
  font-size: 1rem;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #e879a6;
    box-shadow: 0 0 0 3px rgba(232, 121, 166, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchInputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #c2185b;
  font-size: 1.1rem;
  z-index: 1;
`;

const SearchCloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #c2185b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    color: #e879a6;
    background: rgba(232, 121, 166, 0.1);
  }
`;

const SearchResults = styled.div`
  max-height: 50vh;
  overflow-y: auto;
  padding: 1rem;
`;

const SearchResultsHeader = styled.h3`
  color: #c2185b;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const SearchResultItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(232, 121, 166, 0.05);
    border-color: rgba(232, 121, 166, 0.2);
  }
`;

const SearchResultInfo = styled.div`
  flex: 1;
`;

const SearchResultTitle = styled.h4`
  color: #c2185b;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  margin-bottom: 0.25rem;
  font-size: 1rem;
`;

const SearchResultDescription = styled.p`
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const SearchResultPrice = styled.span`
  color: #e879a6;
  font-weight: 600;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  min-width: 160px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1001;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #c2185b;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  
  &:hover {
    background-color: rgba(232, 121, 166, 0.1);
    color: #e879a6;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #c2185b;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  
  &:hover {
    background-color: rgba(232, 121, 166, 0.1);
    color: #e879a6;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #c2185b;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #e879a6;
  }
  
  @media (max-width: 950px) {
    display: block;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  
  @media (max-width: 950px) {
    display: none;
  }
`;

const ResponsiveNavLink = styled(NavLink)`
  @media (max-width: 1050px) {
    display: none;
  }
`;

const WelcomeMessage = styled.div`
  color: #c2185b;
  font-weight: 600;
  font-size: 0.85rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  white-space: nowrap;
  
  @media (max-width: 1150px) {
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 1000px) {
    display: none;
  }
`;

const WelcomeIcon = styled.div`
  color: #c2185b;
  display: flex;
  align-items: center;
`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ services: [], products: [] });
  const [isSearching, setIsSearching] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults({ services: [], products: [] });
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ services: [], products: [] });
      return;
    }

    setIsSearching(true);
    try {
      const [servicesRes, productsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/services`),
        axios.get(`http://localhost:5001/api/products`)
      ]);

      const services = servicesRes.data.filter(service => 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description?.toLowerCase().includes(query.toLowerCase()) ||
        service.category?.toLowerCase().includes(query.toLowerCase())
      );

      const products = productsRes.data.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase()) ||
        product.brand?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults({ services, products });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ services: [], products: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
  };

  // Close search when clicking outside and handle keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSearchOpen && !e.target.closest('.search-modal')) {
        closeSearch();
      }
    };

    const handleKeyDown = (e) => {
      // Open search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isSearchOpen) {
          openSearch();
        }
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  return (
    <Nav>
      <NavContainer>
                  <Logo to="/" onClick={closeMenus}>
            <img src="/logo.webp" alt="Olga's Skincare Logo" />
          </Logo>
        
        <NavLinks $isOpen={isMenuOpen}>
          <NavLink to="/" onClick={closeMenus}>Home</NavLink>
          <NavLink to="/services" onClick={closeMenus}>Corrective Treatments</NavLink>
          <NavLink to="/consultation" onClick={closeMenus}>Consultation</NavLink>
          <NavLink to="/lash-brow" onClick={closeMenus}>Lash & Brow Bar</NavLink>
          <NavLink to="/products" onClick={closeMenus}>Skincare Essentials</NavLink>
          <NavLink to="/about" onClick={closeMenus}>About</NavLink>
          <NavLink to="/contact" onClick={closeMenus}>Contact</NavLink>
          {isAuthenticated && (
            <ResponsiveNavLink to="/booking" onClick={closeMenus}>Book Now</ResponsiveNavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenus}>Admin</NavLink>
          )}
          {/* Mobile-only auth links */}
          {!isAuthenticated && (
            <>
              <NavLink to="/login" onClick={closeMenus} style={{display: 'none'}} className="mobile-only">Login</NavLink>
              <NavLink to="/register" onClick={closeMenus} style={{display: 'none'}} className="mobile-only">Sign Up</NavLink>
            </>
          )}
        </NavLinks>
        
        <NavActions>
          <SearchButton 
            onClick={openSearch}
            aria-label="Search"
          >
            <FiSearch />
          </SearchButton>
          
          <CartButton to="/cart" onClick={closeMenus}>
            <FiShoppingCart />
            {cartCount > 0 && <CartBadge>{cartCount}</CartBadge>}
          </CartButton>
          
          {isAuthenticated ? (
            <>
              <WelcomeMessage>
                <WelcomeIcon>
                  <FiUser size={16} />
                </WelcomeIcon>
                Welcome, {user?.firstName || user?.first_name || 'there'}!
              </WelcomeMessage>
              <UserMenu>
                <UserButton 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                >
                  <FiUser />
                </UserButton>
                <UserDropdown $isOpen={isUserMenuOpen}>
                  <DropdownItem to="/profile" onClick={closeMenus}>
                    <FiUser size={16} />
                    Profile
                  </DropdownItem>
                  <DropdownItem to="/booking" onClick={closeMenus}>
                    <FiCalendar size={16} />
                    Book Appointment
                  </DropdownItem>
                  <DropdownButton onClick={handleLogout}>
                    <FiLogOut size={16} />
                    Logout
                  </DropdownButton>
                </UserDropdown>
              </UserMenu>
            </>
          ) : (
            <AuthButtons>
              <NavLink to="/login" onClick={closeMenus}>Login</NavLink>
              <NavLink to="/register" onClick={closeMenus}>Sign Up</NavLink>
            </AuthButtons>
          )}
          
          <MobileMenuButton 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </NavActions>
      </NavContainer>
      
      <SearchOverlay $isOpen={isSearchOpen}>
        <SearchModal className="search-modal">
          <SearchHeader>
            <SearchInputContainer>
              <SearchInputIcon>
                <FiSearch />
              </SearchInputIcon>
              <SearchInput
                type="text"
                placeholder="Search services and products... (Press Esc to close)"
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleSearchKeyDown}
                autoFocus
              />
            </SearchInputContainer>
            <SearchCloseButton onClick={closeSearch}>
              <FiX />
            </SearchCloseButton>
          </SearchHeader>
          
          <SearchResults>
            {isSearching ? (
              <NoResults>Searching...</NoResults>
            ) : searchQuery.trim() === '' ? (
              <NoResults>Start typing to search for services and products</NoResults>
            ) : searchResults.services.length === 0 && searchResults.products.length === 0 ? (
              <NoResults>No results found for "{searchQuery}"</NoResults>
            ) : (
              <>
                {searchResults.services.length > 0 && (
                  <>
                    <SearchResultsHeader>Corrective Treatments ({searchResults.services.length})</SearchResultsHeader>
                    {searchResults.services.map(service => (
                      <SearchResultItem 
                        key={`service-${service.id}`} 
                        to={`/booking?service=${service.id}`}
                        onClick={closeSearch}
                      >
                        <SearchResultInfo>
                          <SearchResultTitle>{service.name}</SearchResultTitle>
                          <SearchResultDescription>
                            {service.description} • {service.duration} minutes • {service.category}
                          </SearchResultDescription>
                        </SearchResultInfo>
                        <SearchResultPrice>${service.price}</SearchResultPrice>
                      </SearchResultItem>
                    ))}
                  </>
                )}
                
                {searchResults.products.length > 0 && (
                  <>
                    <SearchResultsHeader>Skincare Essentials ({searchResults.products.length})</SearchResultsHeader>
                    {searchResults.products.map(product => (
                      <SearchResultItem 
                        key={`product-${product.id}`} 
                        to="/products"
                        onClick={closeSearch}
                      >
                        <SearchResultInfo>
                          <SearchResultTitle>{product.name}</SearchResultTitle>
                          <SearchResultDescription>
                            {product.description} • {product.brand} • {product.category}
                            {product.stock_quantity > 0 ? ` • ${product.stock_quantity} in stock` : ' • Out of stock'}
                          </SearchResultDescription>
                        </SearchResultInfo>
                        <SearchResultPrice>${product.price}</SearchResultPrice>
                      </SearchResultItem>
                    ))}
                  </>
                )}
              </>
            )}
          </SearchResults>
        </SearchModal>
      </SearchOverlay>
    </Nav>
  );
};

export default Navbar; 