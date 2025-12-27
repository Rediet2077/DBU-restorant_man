import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./Navbar.css";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null); 
    const navigate = useNavigate();

    const closeMenu = () => setOpen(false);

    // --- Authentication Check ---
    useEffect(() => {
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        setUser(currentUser);
    }, [navigate]);

    // --- Scroll Effect ---
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Conditional Display Variables ---
    const isLoggedIn = !!user;
    const isAdmin = user && user.role === 'admin';
    const isCustomer = user && user.role === 'customer';

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        setUser(null); 
        closeMenu();
        navigate("/login"); 
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (open && !event.target.closest('.mobile-sidebar') && !event.target.closest('.mobile-menu-btn')) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <header>
            <div className={`nav-container ${scrolled ? 'scrolled' : ''}`} id="mainNavBar">
                {/* Left side - Hamburger Menu */}
                <div className="left-section">
                    <button 
                        className="mobile-menu-btn" 
                        id="menuBtn" 
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        <span className={`hamburger-line ${open ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${open ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${open ? 'open' : ''}`}></span>
                    </button>
                </div>

                {/* Center - Logo */}
                <div className="center-section">
                    <Link to="/" className="logo-link" onClick={closeMenu}>
                        <div className="logo">
                            <i className="bi bi-egg-fried"></i> 
                            <span className="logo-text">DBU LAUNCH</span>
                        </div>
                    </Link>
                </div>

                {/* Right side - Desktop Navigation */}
                <div className="right-section">
                    <div className="mobile-menu-container">
                        {/* Navigation Links - Desktop */}
                        <nav id="mainNav" className={open ? "active" : ""}>
                            <div className="nav-content">
                                {/* Always Visible Links */}
                                <div className="nav-section">
                                    <Link to="/" onClick={closeMenu}>HOME</Link>
                                    <Link to="/aboutus" onClick={closeMenu}>ABOUT</Link>
                                    <Link to="/service" onClick={closeMenu}>SERVICE</Link>
                                    <Link to="/contactus" onClick={closeMenu}>CONTACT</Link>
                                </div>
                                
                                {/* Role-Based Links */}
                                <div className="nav-section">
                                    {isCustomer && (
                                        <Link to="/UserDashboard" onClick={closeMenu} className="user-link">
                                            <i className="bi bi-person-circle"></i> MY DASHBOARD
                                        </Link>
                                    )}
                                    
                                    {isAdmin && (
                                        <Link to="/admindashboard" onClick={closeMenu} className="admin-link">
                                            <i className="bi bi-gear"></i> ADMIN PANEL
                                        </Link>
                                    )}

                                    {/* Login / Logout */}
                                    {!isLoggedIn ? (
                                        <Link to="/login" onClick={closeMenu} className="login-link">
                                            <i className="bi bi-box-arrow-in-right"></i> LOGIN
                                        </Link>
                                    ) : (
                                        <button onClick={handleLogout} className="nav-logout-btn">
                                            <i className="bi bi-box-arrow-left"></i> LOGOUT ({user.username || user.fullName || 'User'})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            <div className={`mobile-sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <i className="bi bi-egg-fried"></i>
                        <span>DBU LAUNCH</span>
                    </div>
                    <button 
                        className="sidebar-close-btn" 
                        onClick={closeMenu}
                        aria-label="Close menu"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <Link to="/" onClick={closeMenu}>
                            <i className="bi bi-house-door"></i> HOME
                        </Link>
                        <Link to="/aboutus" onClick={closeMenu}>
                            <i className="bi bi-info-circle"></i> ABOUT
                        </Link>
                        <Link to="/service" onClick={closeMenu}>
                            <i className="bi bi-truck"></i> SERVICE
                        </Link>
                        <Link to="/contactus" onClick={closeMenu}>
                            <i className="bi bi-envelope"></i> CONTACT
                        </Link>
                    </div>
                    
                    <div className="sidebar-section">
                        {isCustomer && (
                            <Link to="/UserDashboard" onClick={closeMenu} className="user-link">
                                <i className="bi bi-person-circle"></i> MY DASHBOARD
                            </Link>
                        )}
                        
                        {isAdmin && (
                            <Link to="/admindashboard" onClick={closeMenu} className="admin-link">
                                <i className="bi bi-gear"></i> ADMIN PANEL
                            </Link>
                        )}

                        {!isLoggedIn ? (
                            <Link to="/login" onClick={closeMenu} className="login-link">
                                <i className="bi bi-box-arrow-in-right"></i> LOGIN
                            </Link>
                        ) : (
                            <button onClick={handleLogout} className="sidebar-logout-btn">
                                <i className="bi bi-box-arrow-left"></i> LOGOUT
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};
 
export default Navbar;