import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    color: var(--secondary-color);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Olga's Skincare</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
            Professional skincare services and premium products to help you achieve 
            radiant, healthy skin. Your beauty journey starts here.
          </p>
          <SocialLinks>
            <SocialLink href="#" aria-label="Facebook">
              <FiFacebook />
            </SocialLink>
            <SocialLink href="#" aria-label="Instagram">
              <FiInstagram />
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h3>Quick Links</h3>
          <FooterLink to="/services">Services</FooterLink>
          <FooterLink to="/products">Products</FooterLink>
          <FooterLink to="/booking">Book Appointment</FooterLink>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Services</h3>
          <FooterLink to="/services">Facial Treatments</FooterLink>
          <FooterLink to="/services">Anti-Aging Care</FooterLink>
          <FooterLink to="/services">Deep Cleansing</FooterLink>
          <FooterLink to="/services">Chemical Peels</FooterLink>
          <FooterLink to="/services">Skincare Consultation</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Contact Info</h3>
          <ContactInfo>
            <FiMapPin size={16} />
            <span>18585 Monterey Rd Suite 140 / Studio 12<br />Morgan Hill, California 95037<br />United States</span>
          </ContactInfo>
          <ContactInfo>
            <FiPhone size={16} />
            <span>(831) 233 0612</span>
          </ContactInfo>
          <ContactInfo>
            <FiMail size={16} />
            <span>contact@olgasaboskincare.com</span>
          </ContactInfo>
          
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
              Business Hours
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Mon-Fri: 9:00 AM - 6:00 PM<br />
              Saturday: 10:00 AM - 4:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>&copy; 2024 Olga's Skincare. All rights reserved. | Privacy Policy | Terms of Service</p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer; 