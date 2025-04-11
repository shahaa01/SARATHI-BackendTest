// client/src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'wouter';
import '@/styles/style.css';
import '@/styles/homepage.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import '@/styles/pages/HomePage.scss';

// Font Awesome (from CDN, added to index.html later)

// Initialize Font Awesome
const loadFontAwesome = () => {
  const script = document.createElement('script');
  script.src = 'https://kit.fontawesome.com/a076d05399.js';
  script.crossOrigin = 'anonymous';
  document.body.appendChild(script);
};

const HomePage = () => {
  React.useEffect(() => {
    loadFontAwesome();
    // Initialize service filtering
    const filterServices = (category: string) => {
      const cards = document.querySelectorAll('.service-card');
      const tabs = document.querySelectorAll('.tab-btn');
      
      tabs.forEach(tab => {
        if ((tab as HTMLElement).dataset.category === category) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      cards.forEach(card => {
        if (category === 'popular' || (card as HTMLElement).dataset.category?.includes(category)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    };

    // Add click handlers to category tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const category = (tab as HTMLElement).dataset.category;
        if (category) filterServices(category);
      });
    });

    // Initialize with 'popular' category
    filterServices('popular');
  }, []);

  return (
    <div className="home-page">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="fade-in primary-slogan">Your Trusted Service Partner in Kathmandu</h1>
              <p className="fade-in secondary-slogan">
                Connect with verified local professionals for all your service needs - from plumbers and electricians to tutors and beauticians.
              </p>
              <div className="hero-cta fade-in">
                <Link href="/services" className="primary-btn glow">
                  Explore Services
                </Link>
                <Link href="/provider" className="secondary-btn glow">
                  Become a Provider
                </Link>
              </div>
            </div>
            <div className="hero-search fade-in">
              <div className="search-container">
                <input type="text" placeholder="What service do you need?" />
                <select defaultValue="">
                  <option value="" disabled>Select location</option>
                  <option value="kathmandu">Kathmandu</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="pokhara">Pokhara</option>
                </select>
                <button type="submit" className="search-btn glow">
                  <i className="fas fa-search"></i> Find Services
                </button>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-item fade-in">
              <span className="stat-number">1000+</span>
              <span className="stat-text">Verified Providers</span>
            </div>
            <div className="stat-item fade-in">
              <span className="stat-number">50+</span>
              <span className="stat-text">Service Categories</span>
            </div>
            <div className="stat-item fade-in">
              <span className="stat-number">10,000+</span>
              <span className="stat-text">Happy Customers</span>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="features">
          <div className="container">
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="feature-title">Find Services</h3>
                <p className="feature-description">
                  Discover a wide range of services from trusted providers in your area.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h3 className="feature-title">Easy Communication</h3>
                <p className="feature-description">
                  Connect directly with service providers and discuss your needs.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="feature-title">Verified Reviews</h3>
                <p className="feature-description">
                  Read authentic reviews from other customers to make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="services">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Find trusted professionals for all your needs</p>
          </div>

          <div className="service-categories">
            <div className="category-tabs">
              <button className="tab-btn active glow" data-category="popular">Popular</button>
              <button className="tab-btn glow" data-category="home">Home</button>
              <button className="tab-btn glow" data-category="professional">Professional</button>
              <button className="tab-btn glow" data-category="personal">Personal</button>
            </div>

            <div className="service-grid" id="service-grid">
              {/* Sample Service Cards */}
              <div className="service-card" data-category="popular home">
                <div className="service-icon">
                  <i className="fas fa-wrench"></i>
                </div>
                <h3>Plumber</h3>
                <p>Fix leaks, installations & repairs</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="popular home">
                <div className="service-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3>Electrician</h3>
                <p>Wiring, repairs & installations</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="popular personal">
                <div className="service-icon">
                  <i className="fas fa-cut"></i>
                </div>
                <h3>Tailor</h3>
                <p>Custom clothing & alterations</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="popular home">
                <div className="service-icon">
                  <i className="fas fa-paint-roller"></i>
                </div>
                <h3>Painter</h3>
                <p>Interior & exterior painting</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="home">
                <div className="service-icon">
                  <i className="fas fa-broom"></i>
                </div>
                <h3>Maid</h3>
                <p>Home cleaning & organization</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="home personal">
                <div className="service-icon">
                  <i className="fas fa-utensils"></i>
                </div>
                <h3>Cook</h3>
                <p>Meal preparation & catering</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="professional">
                <div className="service-icon">
                  <i className="fas fa-car"></i>
                </div>
                <h3>Driver</h3>
                <p>Professional driving services</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>

              <div className="service-card" data-category="home">
                <div className="service-icon">
                  <i className="fas fa-leaf"></i>
                </div>
                <h3>Gardener</h3>
                <p>Garden maintenance & design</p>
                <a href="#booking" className="service-link">Book Now</a>
              </div>
            </div>

            <div className="view-all-services">
              <a href="#" className="view-all-btn">
                View All Services <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works">
          <div className="section-header">
            <h2>How Sarathi Works</h2>
            <p>Simple steps to get the help you need</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="step-number">1</div>
              <h3>Search</h3>
              <p>Find the service you need from our wide range of categories</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="step-number">2</div>
              <h3>Book</h3>
              <p>Schedule a convenient time for the service provider to visit</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>Meet with our verified professional who will complete the job</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="step-number">4</div>
              <h3>Review</h3>
              <p>Rate your experience and help others find great service</p>
            </div>
          </div>
        </section>

        {/* Featured Providers Section */}
        <section className="featured-providers">
          <div className="section-header">
            <h2>Top-Rated Service Providers</h2>
            <p>Meet some of our trusted professionals</p>
          </div>

          <div className="providers-slider">
            <div className="provider-card">
              <div className="provider-image">
                <img
                  src="/images/providers/provider1.jpg"
                  alt="Service Provider"
                  onError={(e) => ((e.currentTarget.src = 'https://via.placeholder.com/150'))}
                />
              </div>
              <div className="provider-info">
                <h3>Ramesh Sharma</h3>
                <p className="provider-profession">Electrician</p>
                <div className="provider-rating">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                  <span>4.8</span>
                </div>
                <p className="provider-location"><i className="fas fa-map-marker-alt"></i> Kathmandu</p>
              </div>
            </div>

            <div className="provider-card">
              <div className="provider-image">
                <img
                  src="/images/providers/provider2.jpg"
                  alt="Service Provider"
                  onError={(e) => ((e.currentTarget.src = 'https://via.placeholder.com/150'))}
                />
              </div>
              <div className="provider-info">
                <h3>Sunita Gurung</h3>
                <p className="provider-profession">Beautician</p>
                <div className="provider-rating">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <span>5.0</span>
                </div>
                <p className="provider-location"><i className="fas fa-map-marker-alt"></i> Lalitpur</p>
              </div>
            </div>

            <div className="provider-card">
              <div className="provider-image">
                <img
                  src="/images/providers/provider3.jpg"
                  alt="Service Provider"
                  onError={(e) => ((e.currentTarget.src = 'https://via.placeholder.com/150'))}
                />
              </div>
              <div className="provider-info">
                <h3>Anil Thapa</h3>
                <p className="provider-profession">Plumber</p>
                <div className="provider-rating">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="far fa-star"></i>
                  <span>4.2</span>
                </div>
                <p className="provider-location"><i className="fas fa-map-marker-alt"></i> Bhaktapur</p>
              </div>
            </div>
          </div>

          <div className="become-provider-cta">
            <h3>Are you a skilled professional?</h3>
            <p>Join our network of trusted service providers and grow your business</p>
            <a href="/provider" className="primary-btn provider-btn glow">Become a Provider</a>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Real experiences from satisfied clients</p>
          </div>

          <div className="testimonial-container">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <i className="fas fa-quote-left quote-icon"></i>
                <p>
                  I needed an electrician urgently when my power went out. Sarathi connected me with a professional who arrived within an hour and fixed the issue quickly. Excellent service!
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="/images/testimonials/user1.jpg"
                  alt="Customer"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60')}
                />
                <div className="author-info">
                  <h4>Priya Shrestha</h4>
                  <p>Kathmandu</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <i className="fas fa-quote-left quote-icon"></i>
                <p>
                  Finding a reliable tutor for my daughter was so easy with Sarathi. The platform verified their credentials, and we've been very happy with the quality of teaching. Highly recommend!
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="/images/testimonials/user2.jpg"
                  alt="Customer"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60')}
                />
                <div className="author-info">
                  <h4>Ramesh Poudel</h4>
                  <p>Lalitpur</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <i className="fas fa-quote-left quote-icon"></i>
                <p>
                  I've used Sarathi for plumbing, painting, and gardening services. Every time, the professionals were punctual, skilled, and courteous. It's become my go-to platform for all home services.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="/images/testimonials/user3.jpg"
                  alt="Customer"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60')}
                />
                <div className="author-info">
                  <h4>Sarita Maharjan</h4>
                  <p>Bhaktapur</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking" className="booking">
          <div className="section-header">
            <h2>Book a Service</h2>
            <p>Tell us what you need and we'll connect you with the right professional</p>
          </div>

          <div className="booking-container">
            <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service-type">Service Type</label>
                  <select id="service-type" required defaultValue="">
                    <option value="" disabled>Select a service</option>
                    <option value="plumber">Plumber</option>
                    <option value="electrician">Electrician</option>
                    <option value="tailor">Tailor</option>
                    <option value="painter">Painter</option>
                    <option value="maid">Maid</option>
                    <option value="cook">Cook</option>
                    <option value="driver">Driver</option>
                    <option value="gardener">Gardener</option>
                    <option value="tutor">Tutor</option>
                    <option value="beautician">Beautician</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Your Location</label>
                  <select id="location" required defaultValue="">
                    <option value="" disabled>Select your area</option>
                    <option value="tinkune">Tinkune</option>
                    <option value="baluwatar">Baluwatar</option>
                    <option value="baneshwor">Baneshwor</option>
                    <option value="chabahil">Chabahil</option>
                    <option value="thamel">Thamel</option>
                    <option value="naxal">Naxal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Preferred Date</label>
                  <input type="date" id="date" required />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Preferred Time</label>
                  <input type="time" id="time" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" placeholder="Enter your full name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" placeholder="Enter your phone number" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="details">Service Details</label>
                <textarea id="details" placeholder="Please provide any specific details about the service you need" rows={4}></textarea>
              </div>

              <button type="submit" className="submit-btn glow">Book Now</button>
            </form>

            <div className="booking-info">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Verified Professionals</h3>
                <p>All service providers undergo thorough background checks and skill verification</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-hand-holding-usd"></i>
                </div>
                <h3>Transparent Pricing</h3>
                <p>Know the cost upfront with no hidden fees or surprises</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-headset"></i>
                </div>
                <h3>Customer Support</h3>
                <p>Our team is available 7 days a week to assist with any questions</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about">
          <div className="section-header">
            <h2>About Sarathi</h2>
            <p>Your trusted partner for local services</p>
          </div>

          <div className="about-container">
            <div className="about-content">
              <h3>Our Mission</h3>
              <p>
                Sarathi is a modern service marketplace platform designed to seamlessly connect individuals and households with trusted local service providers across Nepal.
                Whether it's a plumber in Pokhara, a tailor in Kathmandu, or a cook in Lalitpur—Sarathi makes it simple, fast, and reliable.
              </p>

              <h3>What We Offer</h3>
              <ul className="about-features">
                <li>
                  <i className="fas fa-check-circle"></i> Wide Range of Services – From electricians, beauticians, drivers, tutors to gardeners & more.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Location-Based Matching – Find service providers specific to your area.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Verified Professionals – Each provider is background-checked and reviewed.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Opportunities for Youths & Entrepreneurs – Create your own business listing and reach thousands.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Customer Support – We're here to ensure smooth service delivery, always.
                </li>
              </ul>

              <h3>Why Choose Sarathi?</h3>
              <p>
                No need to search endlessly—we bring trusted help to your fingertips. With Sarathi, you get access to pre-screened professionals who are experts in their field,
                fair and transparent pricing, and a platform that's designed with your convenience in mind.
              </p>
            </div>

            <div className="about-image">
              <img
                src="/images/about/about-image.jpg"
                alt="Sarathi Team"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/500x400')}
              />
            </div>
          </div>
        </section>

        {/* App Download Section */}
        <section className="app-download">
          <div className="app-content">
            <h2>Get the Sarathi App</h2>
            <p>Book services on the go with our mobile app</p>

            <div className="app-buttons">
              <a href="#" className="app-btn">
                <i className="fab fa-google-play"></i>
                <span>
                  <small>Get it on</small>
                  Google Play
                </span>
              </a>
              <a href="#" className="app-btn">
                <i className="fab fa-apple"></i>
                <span>
                  <small>Download on the</small>
                  App Store
                </span>
              </a>
            </div>
          </div>

          <div className="app-image">
            <img
              src="/images/app/mobile-app.png"
              alt="Sarathi Mobile App"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x600')}
            />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact">
          <div className="section-header">
            <h2>Contact Us</h2>
            <p>We're here to help with any questions</p>
          </div>

          <div className="contact-container">
            <div className="contact-info">
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Our Office</h3>
                  <p>Tinkune, Kathmandu, Nepal</p>
                </div>
              </div>

              <div className="info-item">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <h3>Phone</h3>
                  <p><a href="tel:+9779819235243">+977 9819235243</a></p>
                </div>
              </div>

              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email</h3>
                  <p><a href="mailto:info@sarathi.com">info@sarathi.com</a></p>
                </div>
              </div>

              <div className="info-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h3>Working Hours</h3>
                  <p>7 days a week, 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Your Name</label>
                    <input type="text" id="contact-name" placeholder="Enter your name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email Address</label>
                    <input type="email" id="contact-email" placeholder="Enter your email" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <input type="text" id="contact-subject" placeholder="Enter subject" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" placeholder="Enter your message" rows={5} required></textarea>
                </div>
                <button type="submit" className="submit-btn glow">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
