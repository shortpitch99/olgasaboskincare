import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart, FiClock, FiArrowRight, FiPhone, FiMapPin, FiMail, FiCalendar } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaLinkedin, FaYelp, FaTiktok } from 'react-icons/fa';
import axios from 'axios';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fefcfe 0%, #fdf9fd 50%, #fcf7fc 100%);
`;

const HeroSection = styled.section`
  background: transparent;
  color: #2c3e50;
  padding: 4rem 0 6rem;
  text-align: center;
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: 3rem;
  
  img {
    max-width: 525px;
    height: auto;
    
    @media (max-width: 768px) {
      max-width: 400px;
    }
  }
`;

const PowerTagline = styled(motion.h2)`
  font-size: 1.8rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #e879a6;
  margin-bottom: 4rem;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  line-height: 1.3;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    letter-spacing: 0.5px;
    margin-bottom: 3rem;
  }
`;

const BookExperienceButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 2.4rem;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.96rem;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: transparent;
  color: #e879a6;
  border: 2px solid #e879a6;
  margin-top: 2rem;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(232, 121, 166, 0.1);
    box-shadow: 0 8px 25px rgba(232, 121, 166, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 0.88rem;
  }
`;

const WelcomeContent = styled(motion.div)`
  margin-top: 4rem;
  max-width: 800px;
  text-align: center;
`;

const WelcomeTitle = styled(motion.h2)`
  font-size: 1.65rem;
  font-weight: 600;
  color: #e879a6;
  margin-bottom: 2rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: extra-condensed;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.35rem;
    margin-bottom: 1.5rem;
  }
`;

const WelcomeText = styled(motion.p)`
  font-size: 0.85rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1.2rem;
  font-family: 'Calibri', 'Inter', sans-serif;
  font-stretch: extra-condensed;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
`;

const LocationSection = styled(motion.div)`
  margin-top: 4rem;
  text-align: center;
  padding: 2rem;
  background: rgba(232, 121, 166, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(232, 121, 166, 0.2);
  max-width: 600px;
`;

const LocationTitle = styled(motion.h3)`
  font-size: 1.6rem;
  font-weight: 600;
  color: #e879a6;
  margin-bottom: 1rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const LocationSubtitle = styled(motion.p)`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1.5rem;
  font-family: 'Calibri', 'Inter', sans-serif;
  font-stretch: condensed;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LocationAddress = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 2rem;
  font-family: 'Calibri', 'Inter', sans-serif;
  font-stretch: condensed;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const LocationContact = styled(motion.div)`
  margin: 1.5rem 0;
  text-align: center;
`;

const LocationContactItem = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 0.8rem;
  font-family: 'Calibri', 'Inter', sans-serif;
  font-stretch: condensed;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const ContactLabel = styled.span`
  font-weight: 600;
  color: #e879a6;
  display: block;
  margin-bottom: 0.3rem;
`;

const MapButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  background: #e879a6;
  color: white;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  box-shadow: 0 4px 15px rgba(232, 121, 166, 0.3);

  &:hover {
    background: #d55a93;
    box-shadow: 0 6px 20px rgba(232, 121, 166, 0.4);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1.6rem;
    font-size: 0.9rem;
  }
`;

// Service Category Sections
const ServiceCategorySection = styled(motion.div)`
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fefefe 0%, #f9f9f9 100%);
  border-bottom: 1px solid rgba(232, 121, 166, 0.1);
`;

const ServiceCategoryTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ServiceCategorySubtitle = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ServiceCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(232, 121, 166, 0.2);
  }
`;

const ServiceCardContent = styled.div`
  padding: 2rem;
`;

const ServiceName = styled.h3`
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.8rem;
  font-weight: 600;
`;

const ServiceDescription = styled.p`
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
`;

const ServiceDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ServicePrice = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  color: #e879a6;
`;

const ServiceDuration = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const ServiceBookButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e879a6, #d55a93);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: linear-gradient(135deg, #d55a93, #c44a84);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(232, 121, 166, 0.3);
  }
`;

const SocialMediaSection = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f4f8 0%, #f5f0f5 100%);
  border-top: 1px solid rgba(232, 121, 166, 0.1);
`;

const SocialMediaTitle = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const SocialMediaGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const SocialIcon = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &.email {
    background: linear-gradient(135deg, #e879a6 0%, #d55a93 100%);
    &:hover {
      background: linear-gradient(135deg, #d55a93 0%, #c44a84 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(232, 121, 166, 0.4);
    }
  }
  
  &.facebook {
    background: linear-gradient(135deg, #1877f2 0%, #166fe5 100%);
    &:hover {
      background: linear-gradient(135deg, #166fe5 0%, #1461cc 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(24, 119, 242, 0.4);
    }
  }
  
  &.instagram {
    background: linear-gradient(135deg, #e4405f 0%, #833ab4 50%, #fccc63 100%);
    &:hover {
      background: linear-gradient(135deg, #d62951 0%, #7a348f 50%, #f5b942 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(228, 64, 95, 0.4);
    }
  }
  
  &.linkedin {
    background: linear-gradient(135deg, #0077b5 0%, #005885 100%);
    &:hover {
      background: linear-gradient(135deg, #005885 0%, #004561 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 119, 181, 0.4);
    }
  }
  
  &.yelp {
    background: linear-gradient(135deg, #d32323 0%, #b71c1c 100%);
    &:hover {
      background: linear-gradient(135deg, #b71c1c 0%, #8e0000 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(211, 35, 35, 0.4);
    }
  }
  
  &.tiktok {
    background: linear-gradient(135deg, #000000 0%, #ff0050 50%, #00f2ea 100%);
    &:hover {
      background: linear-gradient(135deg, #1a1a1a 0%, #e6004a 50%, #00d9d1 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
  }
  
  svg {
    font-size: 1.5rem;
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    
    svg {
      font-size: 1.25rem;
    }
  }
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(212, 175, 55, 0.4);
  }
`;


// Services Section
const ServicesSection = styled.section`
  padding: 6rem 0;
  background: white;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h2 {
    font-size: 3rem;
    font-weight: 300;
    margin-bottom: 1rem;
    color: #2c3e50;
    font-family: 'Calibri', 'Playfair Display', serif;
    font-stretch: condensed;
    
    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    font-family: 'Calibri', 'Arial', sans-serif;
    font-stretch: condensed;
  }
`;

const ViewAllLink = styled(Link)`
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    gap: 1rem;
  }
`;

// Enhanced service cards
const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  }
`;

const ItemImage = styled.div`
  height: 160px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  font-size: 2.5rem;
  position: relative;
  overflow: hidden;
`;

const ItemContent = styled.div`
  padding: 1.5rem;
`;

const ItemCategory = styled.span`
  color: #d4af37;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ItemTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: #2c3e50;
`;

const ItemDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ItemPrice = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #d4af37;
`;

const ItemDuration = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
`;

// Contact CTA Section
const CTASection = styled.section`
  padding: 6rem 0;
  background: #f8f9fa;
  text-align: center;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;
`;

const CTASubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  
  .icon {
    color: #d4af37;
    font-size: 1.5rem;
  }
  
  div {
    text-align: left;
    
    h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.2rem;
      color: #2c3e50;
    }
    
    p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
  }
`;

const ServiceTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const ServiceTab = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#c2185b'};
  border: 2px solid ${props => props.active ? 'transparent' : '#e879a6'};
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : 'rgba(232, 121, 166, 0.1)'};
    color: ${props => props.active ? 'white' : '#e879a6'};
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const NoResults = styled.div`
  font-family: 'Calibri', 'Arial', sans-serif;
  font-stretch: condensed;
`;

const Home = () => {
  const [featuredServices, setFeaturedServices] = useState([]);

  const fetchFeaturedServices = async () => {
    try {
      const response = await axios.get('/api/services');
      const services = response.data;
      setFeaturedServices(services.slice(0, 3));
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <HomeContainer>
      
      {/* Hero Section */}
      <HeroSection>
        <HeroContent
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <PowerTagline variants={itemVariants}>
            EXPERIENCE THE POWER OF<br />
            PERSONALIZED SKINCARE
          </PowerTagline>

          <LogoContainer variants={itemVariants}>
            <img 
              src="/logo.webp" 
              alt="Olga's Skincare Studio"
            />
          </LogoContainer>

          <BookExperienceButton
            to="/booking"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiClock />
            BOOK YOUR EXPERIENCE
          </BookExperienceButton>

          <WelcomeContent variants={itemVariants}>
            <WelcomeTitle>Welcome to Olga Sabo Skincare Studio</WelcomeTitle>
            <WelcomeText>
              At OlgaSabo Skincare Studio, we think differently and our mission is to change the way we treat skin, empowering its innate ability to heal itself to create lasting results without compromise. Our focus is on healing, not harming.
            </WelcomeText>
            <WelcomeText>
              At Olga Sabo Skincare Studio, we believe in a systemic approach to resolving skin concerns. Our treatments combine natural, nourishing ingredients essential to activate repair and address challenging skin conditions with expert techniques to achieve authentic transformations and overall well-being.
            </WelcomeText>
            <WelcomeText>
              At OlgaSabo Skincare Studio, we go more than skin deep to find out the source of common concerns. By integrating medical grade, non-toxic, topical formulas with strategic facial services we address the root causes of many skin issues and help you achieve clear, healthy, and radiant skin.
            </WelcomeText>
            <WelcomeText>
              Experience Personalized Transforming Skin Treatments at Olga Sabo Skincare Studio and discover the difference of Holistic Care.
            </WelcomeText>
          </WelcomeContent>

          <LocationSection variants={itemVariants}>
            <LocationTitle>🌸 Olga Sabo Skincare Studio 🌸</LocationTitle>
            <LocationSubtitle>AT SOLA SALONS OF MORGAN HILL, CA</LocationSubtitle>
            <LocationAddress>
              📍 18585 MONTEREY ROAD SUITE 140 / STUDIO 12<br />
              MORGAN HILL, CALIFORNIA 95037
            </LocationAddress>
            
            <LocationContact variants={itemVariants}>
              <LocationContactItem>
                <ContactLabel>Phone</ContactLabel>
                (831) 233-0612
              </LocationContactItem>
              <LocationContactItem>
                <ContactLabel>Email</ContactLabel>
                olga.sabo.esthetics@gmail.com
              </LocationContactItem>
            </LocationContact>
            
            <MapButton 
              href="https://maps.google.com/maps?q=18585+Monterey+Road+Suite+140,+Morgan+Hill,+CA+95037" 
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📍 Find Us on the Map
            </MapButton>
          </LocationSection>
        </HeroContent>
      </HeroSection>



      <SocialMediaSection 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <SocialMediaTitle>Connect With Us</SocialMediaTitle>
        <SocialMediaGrid>
          <SocialIcon
            href="mailto:olga.sabo.esthetics@gmail.com"
            className="email"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiMail />
          </SocialIcon>
          
          <SocialIcon
            href="https://www.facebook.com/OlgaSaboSkincareStudio"
            className="facebook"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFacebook />
          </SocialIcon>
          
          <SocialIcon
            href="https://www.instagram.com/olga.sabo.esthetics"
            className="instagram"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaInstagram />
          </SocialIcon>
          
          <SocialIcon
            href="https://www.linkedin.com/in/OlgaSabo"
            className="linkedin"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaLinkedin />
          </SocialIcon>
          
          <SocialIcon
            href="https://yelp.com/biz/OlgaSabo"
            className="yelp"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaYelp />
          </SocialIcon>
          
          <SocialIcon
            href="#"
            className="tiktok"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTiktok />
          </SocialIcon>
        </SocialMediaGrid>
      </SocialMediaSection>

    </HomeContainer>
  );
};

export default Home;
