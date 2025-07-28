import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart, FiClock, FiArrowLeft, FiCalendar, FiDollarSign, FiInfo, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 70vh;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-dark);
    transform: translateX(-5px);
  }
`;

const ServiceHeader = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ServiceImage = styled.div`
  height: 400px;
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl})` 
    : 'linear-gradient(135deg, #4CAF50, #2E7D32)'
  };
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 6rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.imageUrl ? 'rgba(0, 0, 0, 0.3)' : 'transparent'};
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--secondary-color);
    z-index: 2;
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ServiceCategory = styled.span`
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
  width: fit-content;
`;

const ServiceTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ServiceDescription = styled.p`
  color: var(--text-light);
  line-height: 1.8;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const ServiceMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: #fafafa;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
  }
`;

const MetricIcon = styled.div`
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BookingSection = styled(motion.div)`
  background: linear-gradient(135deg, #fefefe 0%, #f9f9f9 100%);
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 3rem;
`;

const BookingTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`;

const BookingText = styled.p`
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const BookButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const DetailsSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const DetailsTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--text-light);
  line-height: 1.6;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: var(--text-light);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 10px;
  color: #c33;
  
  h3 {
    margin-bottom: 1rem;
    color: #a22;
  }
`;

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`/api/services/${id}`);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Service not found or temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  // Get service benefits from database or provide defaults
  const getServiceBenefits = (service) => {
    if (service.benefits && service.benefits.trim()) {
      // Split by newlines and filter out empty lines
      return service.benefits.split('\n').filter(benefit => benefit.trim());
    }
    
    // Default benefits if none provided
    return [
      'Professional skincare treatment by certified estheticians',
      'Customized approach for your unique skin needs',
      'High-quality, professional-grade products',
      'Relaxing and rejuvenating experience',
      'Visible improvement in skin health and appearance',
      'Expert advice on skincare maintenance'
    ];
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading service details...</LoadingSpinner>
      </Container>
    );
  }

  if (error || !service) {
    return (
      <Container>
        <BackButton to="/services">
          <FiArrowLeft /> Back to Services
        </BackButton>
        <ErrorMessage>
          <h3>Service Not Found</h3>
          <p>{error || 'The requested service could not be found.'}</p>
          <p>Please check our available services or contact us for assistance.</p>
        </ErrorMessage>
      </Container>
    );
  }

  const benefits = getServiceBenefits(service);

  return (
    <Container>
      <BackButton to="/services">
        <FiArrowLeft /> Back to Services
      </BackButton>

      <ServiceHeader
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ServiceImage imageUrl={service.image_url}>
          {!service.image_url && <FiHeart style={{ position: 'relative', zIndex: 3 }} />}
        </ServiceImage>
        
        <ServiceInfo>
          {service.category && <ServiceCategory>{service.category}</ServiceCategory>}
          <ServiceTitle>{service.name}</ServiceTitle>
          <ServiceDescription>{service.description}</ServiceDescription>
          
          <ServiceMetrics>
            <MetricCard>
              <MetricIcon><FiDollarSign size={24} /></MetricIcon>
              <MetricValue>${service.price}</MetricValue>
              <MetricLabel>Price</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricIcon><FiClock size={24} /></MetricIcon>
              <MetricValue>{service.duration}</MetricValue>
              <MetricLabel>Minutes</MetricLabel>
            </MetricCard>
          </ServiceMetrics>
        </ServiceInfo>
      </ServiceHeader>

      <BookingSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <BookingTitle>Ready to Book Your Treatment?</BookingTitle>
        <BookingText>
          Schedule your {service.name} appointment today and experience the difference 
          professional skincare can make for your skin.
        </BookingText>
        <BookButton to={`/booking?service=${service.id}`}>
          <FiCalendar />
          Book This Service
        </BookButton>
      </BookingSection>

      <DetailsSection>
        <DetailsTitle>
          <FiInfo />
          Treatment Benefits
        </DetailsTitle>
        <BenefitsList>
          {benefits.map((benefit, index) => (
            <BenefitItem key={index}>
              <FiCheckCircle size={20} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
              {benefit}
            </BenefitItem>
          ))}
        </BenefitsList>
      </DetailsSection>
    </Container>
  );
};

export default ServiceDetail; 