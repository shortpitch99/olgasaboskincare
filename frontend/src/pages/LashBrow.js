import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiClock, FiImage } from 'react-icons/fi';
import axios from 'axios';

const LashBrowContainer = styled.div`
  min-height: 100vh;
  padding-top: 100px;
  background: linear-gradient(135deg, #f9f7ff 0%, #f5f3ff 100%);
`;

const Header = styled.section`
  background: linear-gradient(135deg, #f9f7ff 0%, #f5f3ff 100%);
  padding: 80px 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #6c757d;
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.6;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  padding: 0 20px 80px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ServiceCard = styled.div`
  background: #fafafa;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceImageContainer = styled.div`
  height: 220px;
  background: #faf8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const ServiceImageElement = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ServiceCard}:hover & {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8e44ad;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
  
  svg {
    font-size: 3rem;
    margin-bottom: 10px;
    opacity: 0.7;
  }
`;

const ServiceContent = styled.div`
  padding: 30px;
`;

const ServiceName = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const ServiceDescription = styled.p`
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 1rem;
`;

const ServiceBenefits = styled.div`
  margin-bottom: 20px;
  
  h4 {
    color: #8e44ad;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ServiceMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ServicePrice = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #8e44ad;
`;

const ServiceDuration = styled.span`
  display: flex;
  align-items: center;
  color: #6c757d;
  font-size: 1rem;
  
  svg {
    margin-right: 8px;
  }
`;

const BookButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #8e44ad;
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background: #732d91;
    transform: translateY(-2px);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 1.2rem;
  color: #6c757d;
`;

const NoServicesMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  h3 {
    color: #2c3e50;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c757d;
    font-size: 1.1rem;
  }
`;

const LashBrow = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLashBrowServices();
  }, []);

  const fetchLashBrowServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/services/category/LASH & BROW BAR');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching lash & brow services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceBenefits = (service) => {
    if (service.benefits && service.benefits.trim()) {
      return service.benefits;
    }
    // Default benefits for lash & brow services
    return "Enhanced natural beauty, long-lasting results, professional application techniques.";
  };

  return (
    <LashBrowContainer>
      <Header>
        <Title>Lash & Brow Bar</Title>
        <Subtitle>
          Enhance your natural beauty with our professional lash and brow services. From extensions to lamination, we'll give you the perfect look to frame your face.
        </Subtitle>
      </Header>

      {loading ? (
        <LoadingMessage>Loading lash & brow services...</LoadingMessage>
      ) : services.length === 0 ? (
        <NoServicesMessage>
          <h3>No Lash & Brow Services Available</h3>
          <p>Please check back soon for our lash and brow offerings.</p>
        </NoServicesMessage>
      ) : (
        <ServicesGrid>
          {services.map((service) => (
            <ServiceCard key={service.id}>
              <ServiceImageContainer>
                {service.image_url ? (
                  <ServiceImageElement 
                    src={service.image_url} 
                    alt={service.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'none';
                      }
                    }}
                  />
                ) : null}
                <ImagePlaceholder style={{ display: service.image_url ? 'none' : 'flex' }}>
                  <FiImage />
                  <span>Image Coming Soon</span>
                </ImagePlaceholder>
              </ServiceImageContainer>
              
              <ServiceContent>
                <ServiceName>{service.name}</ServiceName>
                <ServiceDescription>{service.description}</ServiceDescription>
                
                <ServiceBenefits>
                  <h4>Treatment Benefits:</h4>
                  <p>{getServiceBenefits(service)}</p>
                </ServiceBenefits>
                
                <ServiceMeta>
                  <ServicePrice>${service.price}</ServicePrice>
                  <ServiceDuration>
                    <FiClock />
                    {service.duration} min
                  </ServiceDuration>
                </ServiceMeta>
                
                <BookButton href={`/services/${service.id}`}>
                  Learn More
                </BookButton>
              </ServiceContent>
            </ServiceCard>
          ))}
        </ServicesGrid>
      )}
    </LashBrowContainer>
  );
};

export default LashBrow; 
