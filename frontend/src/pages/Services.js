import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart, FiClock, FiFilter, FiImage } from 'react-icons/fi';
import axios from 'axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 70vh;
`;

const Header = styled.section`
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  background: linear-gradient(135deg, #fefefe 0%, #f9f9f9 100%);
  border-radius: 15px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : '#dee2e6'};
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-dark)'};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    border-color: var(--primary-color);
    background: ${props => props.active ? 'var(--primary-color)' : 'var(--primary-color)'};
    color: white;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ServiceCard = styled(motion.div)`
  background: #fafafa;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ServiceImageContainer = styled.div`
  height: 320px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fffef7, #f8f5f0);
  border-bottom: 3px solid var(--secondary-color);
`;

const ServiceImageElement = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b7355;
  text-align: center;
  padding: 2rem;
  z-index: 2;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }
  
  .text {
    font-size: 1.1rem;
    font-weight: 500;
    color: #6b5b47;
  }
`;

const ServiceContent = styled.div`
  padding: 2rem;
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
`;

const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
  line-height: 1.3;
`;

const ServiceDescription = styled.p`
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ServiceDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ServicePrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const ServiceDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-weight: 500;
`;

const BookButton = styled(Link)`
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  display: block;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: var(--text-light);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-dark);
  }
`;

// Component to handle image loading with fallback
const ServiceImage = ({ imageUrl, serviceName }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  return (
    <ServiceImageContainer>
      {imageUrl && !imageError && (
        <ServiceImageElement
          src={imageUrl}
          alt={serviceName}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      )}
      {(!imageUrl || imageError || !imageLoaded) && (
        <ImagePlaceholder>
          <FiImage className="icon" />
          <div className="text">Image Coming Soon</div>
        </ImagePlaceholder>
      )}
    </ServiceImageContainer>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(response.data.map(service => service.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (selectedCategory === 'All') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.category === selectedCategory));
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading our services...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Our Professional Services</Title>
        <Subtitle>
          Discover our range of expert skincare treatments designed to enhance your natural beauty 
          and restore your skin's healthy glow.
        </Subtitle>
      </Header>

      {categories.length > 1 && (
        <FilterSection>
          <FiFilter size={20} color="var(--text-light)" />
          {categories.map(category => (
            <FilterButton
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </FilterButton>
          ))}
        </FilterSection>
      )}

      {filteredServices.length === 0 ? (
        <EmptyState>
          <h3>No Services Found</h3>
          <p>
            {selectedCategory === 'All' 
              ? "We're currently updating our services. Please check back soon!"
              : `No services found in the "${selectedCategory}" category. Try selecting a different category.`
            }
          </p>
        </EmptyState>
      ) : (
        <ServicesGrid>
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ServiceImage 
                imageUrl={service.image_url}
                serviceName={service.name}
              />
              <ServiceContent>
                {service.category && <ServiceCategory>{service.category}</ServiceCategory>}
                <ServiceTitle>{service.name}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
                <ServiceDetails>
                  <ServicePrice>${service.price}</ServicePrice>
                  <ServiceDuration>
                    <FiClock />
                    {service.duration} min
                  </ServiceDuration>
                </ServiceDetails>
                <BookButton to={`/services/${service.id}`}>
                  Learn More
                </BookButton>
              </ServiceContent>
            </ServiceCard>
          ))}
        </ServicesGrid>
      )}
    </Container>
  );
};

export default Services; 
