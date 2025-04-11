import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import '@/styles/pages/services/ServiceDetail.scss';

interface ServiceDetailProps {
    serviceId?: string;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId }) => {
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    useEffect(() => {
        // TODO: Fetch service data from API
        const fetchServiceData = async () => {
            try {
                // const response = await fetch(`/api/services/${serviceId}`);
                // const data = await response.json();
                // setService(data);
                
                // Mock data for now
                setService({
                    id: serviceId,
                    name: 'Plumbing Services',
                    description: 'Professional plumbing services for residential and commercial properties...',
                    price: '$50/hr',
                    providers: [
                        {
                            id: '1',
                            name: 'John Doe',
                            rating: 4.8,
                            reviews: 128,
                            location: 'New York, NY',
                        },
                        {
                            id: '2',
                            name: 'Jane Smith',
                            rating: 4.9,
                            reviews: 256,
                            location: 'Brooklyn, NY',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching service data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [serviceId]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!service) {
        return <div className="error">Service not found</div>;
    }

    return (
        <div className="service-detail-page">
            <Header />
            
            <main>
                <section className="service-header">
                    <h1>{service.name}</h1>
                    <p className="price">{service.price}</p>
                    <p className="description">{service.description}</p>
                </section>

                <section className="providers-section">
                    <h2>Available Providers</h2>
                    <div className="providers-list">
                        {service.providers.map((provider: any) => (
                            <div 
                                key={provider.id} 
                                className={`provider-card ${selectedProvider?.id === provider.id ? 'selected' : ''}`}
                                onClick={() => setSelectedProvider(provider)}
                            >
                                <div className="provider-info">
                                    <h3>{provider.name}</h3>
                                    <div className="rating">
                                        <span className="stars">★★★★★</span>
                                        <span className="rating-value">{provider.rating}</span>
                                        <span className="reviews">({provider.reviews} reviews)</span>
                                    </div>
                                    <p className="location">{provider.location}</p>
                                </div>
                                <Button 
                                    variant={selectedProvider?.id === provider.id ? 'primary' : 'outline'}
                                    size="medium"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle booking
                                    }}
                                >
                                    {selectedProvider?.id === provider.id ? 'Book Now' : 'Select'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                {selectedProvider && (
                    <section className="booking-section">
                        <h2>Book with {selectedProvider.name}</h2>
                        <div className="booking-form">
                            {/* Booking form will be implemented later */}
                            <Button variant="primary" size="large" fullWidth>
                                Continue to Booking
                            </Button>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ServiceDetail; 