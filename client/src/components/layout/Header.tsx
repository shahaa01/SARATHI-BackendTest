import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import '../../styles/components/Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
    };

    return (
        <>
            <header ref={headerRef} className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="header-container">
                        <Link href="/" className="logo">
                            <h1>Sarathi</h1>
                        </Link>

                        <div className="menu-toggle" onClick={toggleMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                            <Link href="/">Home</Link>
                            <Link href="/services">Services</Link>
                            <Link href="/book">Book Now</Link>
                            <Link href="/about">About Us</Link>
                            <Link href="/contact">Contact</Link>
                        </nav>

                        <div className="auth-buttons">
                            <Link href="/auth" className="login-btn">Login</Link>
                            <Link href="/auth?register=true" className="register-btn">Register</Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
                <div className="close-menu" onClick={toggleMenu}>
                    <i className="fas fa-times"></i>
                </div>
                <nav>
                    <Link href="/" onClick={toggleMenu}>Home</Link>
                    <Link href="/services" onClick={toggleMenu}>Services</Link>
                    <Link href="/book" onClick={toggleMenu}>Book Now</Link>
                    <Link href="/about" onClick={toggleMenu}>About Us</Link>
                    <Link href="/contact" onClick={toggleMenu}>Contact</Link>
                </nav>
                <div className="mobile-auth">
                    <Link href="/auth" className="login-btn" onClick={toggleMenu}>Login</Link>
                    <Link href="/auth?register=true" className="register-btn" onClick={toggleMenu}>Register</Link>
                </div>
            </div>

            <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>
        </>
    );
};

export default Header; 