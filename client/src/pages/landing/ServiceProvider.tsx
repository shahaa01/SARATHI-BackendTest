import { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import '../../styles/landing/service-provider.css';

const ServiceProvider = () => {
    const [showIntro, setShowIntro] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hours, setHours] = useState(20);
    const [weeklyIncome, setWeeklyIncome] = useState(10000);
    const [monthlyIncome, setMonthlyIncome] = useState(40000);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current) {
                if (window.scrollY > 50) {
                    headerRef.current.classList.add('scrolled');
                } else {
                    headerRef.current.classList.remove('scrolled');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const updateIncomeEstimate = () => {
        // This is a simplified version of the income calculation
        // In a real app, this would use more complex calculations based on service type and area
        const baseRate = 500; // Base rate per hour
        const weekly = hours * baseRate;
        const monthly = weekly * 4;
        
        setWeeklyIncome(weekly);
        setMonthlyIncome(monthly);
    };

    useEffect(() => {
        updateIncomeEstimate();
    }, [hours]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="service-provider-page">
            {showIntro && (
                <div className="intro-container" style={{ opacity: showIntro ? 1 : 0 }}>
                    <div className="intro-text">Sarathi</div>
                </div>
            )}

            <header ref={headerRef}>
                <Link href="/" className="header-a">
                    <h1>Sarathi</h1>
                </Link>
                <nav>
                    <div 
                        className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
                        onClick={toggleMenu}
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </div>
                    <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                        <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
                        <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
                        <li><a href="#booking" onClick={() => scrollToSection('booking')}>Book Now</a></li>
                        <li><a href="#about" onClick={() => scrollToSection('about')}>About Us</a></li>
                        <li><a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a></li>
                        <li><Link href="/auth" className="login-button">Login</Link></li>
                    </ul>
                </nav>
            </header>

            <main>
                <section className="provider-hero">
                    <div className="provider-hero-content">
                        <h2 className="fade-in">Become a Sarathi Service Provider</h2>
                        <p className="fade-in">Join our trusted network of professionals and earn on your own terms</p>
                        <a href="#apply-now" className="cta-button fade-in" onClick={() => scrollToSection('apply-now')}>
                            Apply Now
                        </a>
                    </div>
                </section>

                <section id="estimate-income">
                    <div className="container">
                        <div className="worker-img">
                            <img src="/images/serviceProviderPage/asian-img.jpg" alt="Image of a Service Provider" />
                            <div className="success-badge">
                                <div className="badge-icon">★</div>
                                <div className="badge-text">
                                    <h4>Trusted Providers</h4>
                                    <p>Join 1000+ professionals</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="estimate-calc">
                            <h2>Earn money your way</h2>
                            <h3>See how much you can make working on Sarathi</h3>
                            
                            <div className="calculator-card">
                                <form id="income-calculator">
                                    <div className="form-group">
                                        <label htmlFor="area">Your Service Area</label>
                                        <select name="area" id="area">
                                            <option value="" disabled selected>Select your area</option>
                                            <option value="tinkune">Tinkune</option>
                                            <option value="baluwatar">Baluwatar</option>
                                            {/* Add other areas */}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="service-type">Service Type</label>
                                        <select name="service-type" id="service-type">
                                            <option value="" disabled selected>Select service type</option>
                                            <option value="plumber">Plumber</option>
                                            <option value="electrician">Electrician</option>
                                            {/* Add other services */}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="hours-weekly">Hours per Week</label>
                                        <div className="range-container">
                                            <input 
                                                type="range" 
                                                id="hours-weekly" 
                                                min="5" 
                                                max="40" 
                                                value={hours}
                                                onChange={(e) => setHours(Number(e.target.value))}
                                                step="5"
                                            />
                                            <div className="range-value">
                                                <span id="hours-value">{hours}</span> hours
                                            </div>
                                        </div>
                                    </div>

                                    <div className="income-results">
                                        <div className="income-box">
                                            <span className="income-title">Weekly Potential Income</span>
                                            <span className="income-amount">
                                                NRs. <span id="weekly-income">{weeklyIncome.toLocaleString()}</span>
                                            </span>
                                        </div>
                                        <div className="income-box">
                                            <span className="income-title">Monthly Potential Income</span>
                                            <span className="income-amount">
                                                NRs. <span id="monthly-income">{monthlyIncome.toLocaleString()}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <button type="button" className="calculate-btn" onClick={updateIncomeEstimate}>
                                        Calculate
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="benefits">
                    <div className="container">
                        <h2>Why become a Sarathi Service Provider?</h2>
                        
                        <div className="benefits-grid">
                            <div className="benefit-card">
                                <div className="benefit-icon">💰</div>
                                <h3>Competitive Earnings</h3>
                                <p>Set your own rates and keep 85% of what you earn. Top providers make NRs. 50,000+ monthly.</p>
                            </div>
                            
                            <div className="benefit-card">
                                <div className="benefit-icon">⏰</div>
                                <h3>Flexible Schedule</h3>
                                <p>Work when you want. Set your availability and take jobs that fit your schedule.</p>
                            </div>
                            
                            <div className="benefit-card">
                                <div className="benefit-icon">🏠</div>
                                <h3>Work Locally</h3>
                                <p>Choose jobs in your neighborhood to minimize travel time and maximize earnings.</p>
                            </div>
                            
                            <div className="benefit-card">
                                <div className="benefit-icon">📱</div>
                                <h3>Easy Platform</h3>
                                <p>Our user-friendly app makes it simple to manage jobs, communicate with clients, and get paid.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-it-works">
                    <div className="container">
                        <h2>How Sarathi Works For Providers</h2>
                        
                        <div className="steps">
                            <div className="step">
                                <div className="step-number">1</div>
                                <h3>Create your profile</h3>
                                <p>Sign up and highlight your skills, experience, and availability</p>
                            </div>
                            
                            <div className="step">
                                <div className="step-number">2</div>
                                <h3>Get verified</h3>
                                <p>Complete our quick verification process to build trust with clients</p>
                            </div>
                            
                            <div className="step">
                                <div className="step-number">3</div>
                                <h3>Receive job requests</h3>
                                <p>Clients in your area will request your services</p>
                            </div>
                            
                            <div className="step">
                                <div className="step-number">4</div>
                                <h3>Complete jobs & get paid</h3>
                                <p>Provide excellent service and receive payment directly to your account</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ServiceProvider; 