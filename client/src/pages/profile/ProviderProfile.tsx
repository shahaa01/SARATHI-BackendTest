import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import '@/styles/pages/profile/ProviderProfile.scss';

interface ProviderProfileProps {
    providerId?: string;
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ providerId }) => {
    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('services');

    useEffect(() => {
        // TODO: Fetch provider data from API
        const fetchProviderData = async () => {
            try {
                // const response = await fetch(`/api/providers/${providerId}`);
                // const data = await response.json();
                // setProvider(data);
                
                // Mock data for now
                setProvider({
                    id: providerId,
                    name: 'John Doe',
                    rating: 4.8,
                    reviews: 128,
                    location: 'New York, NY',
                    services: [
                        { id: 1, name: 'Plumbing', price: '$50/hr' },
                        { id: 2, name: 'Electrical', price: '$60/hr' },
                    ],
                    about: 'Experienced service provider with 10+ years of expertise...',
                    availability: 'Mon-Fri: 9AM-6PM',
                });
            } catch (error) {
                console.error('Error fetching provider data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProviderData();
    }, [providerId]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!provider) {
        return <div className="error">Provider not found</div>;
    }

    return (
        <div className="provider-profile-page">
            <Header />
            
            <main>
                <section className="profile-header">
                    <div className="profile-info">
                        <h1>{provider.name}</h1>
                        <div className="rating">
                            <span className="stars">★★★★★</span>
                            <span className="rating-value">{provider.rating}</span>
                            <span className="reviews">({provider.reviews} reviews)</span>
                        </div>
                        <p className="location">{provider.location}</p>
                    </div>
                    <div className="profile-actions">
                        <Button variant="primary" size="large" onClick={() => {}}>
                            Book Now
                        </Button>
                        <Button variant="outline" size="medium" onClick={() => {}}>
                            Message
                        </Button>
                    </div>
                </section>

                <section className="profile-content">
                    <nav className="profile-tabs">
                        <button
                            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            Services
                        </button>
                        <button
                            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            About
                        </button>
                        <button
                            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews
                        </button>
                    </nav>

                    <div className="tab-content">
                        {activeTab === 'services' && (
                            <div className="services-list">
                                {provider.services.map((service: any) => (
                                    <div key={service.id} className="service-card">
                                        <h3>{service.name}</h3>
                                        <p className="price">{service.price}</p>
                                        <Button variant="primary" size="small">
                                            Book Service
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="about-section">
                                <h2>About {provider.name}</h2>
                                <p>{provider.about}</p>
                                <div className="availability">
                                    <h3>Availability</h3>
                                    <p>{provider.availability}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-section">
                                {/* Reviews will be implemented later */}
                                <p>No reviews yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ProviderProfile; 