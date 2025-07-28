import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaLinkedin, FaYelp, FaTiktok } from 'react-icons/fa';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  padding: 2rem 0;
`;

const HeroSection = styled(motion.section)`
  padding: 4rem 0 2rem 0;
  text-align: center;
  background: linear-gradient(135deg, #fdfbfb 0%, #f8f9fa 100%);
  color: #2c3e50;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0 1rem;
  }
`;

const ContactSection = styled(motion.section)`
  padding: 4rem 0;
`;

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactInfo = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e879a6;
`;

const BusinessName = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;
  letter-spacing: 1px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(232, 121, 166, 0.2);
  }

  .icon {
    color: #e879a6;
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
`;

const ContactText = styled.div`
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
  }

  p {
    color: #6c757d;
    line-height: 1.5;
    margin: 0;
  }

  a {
    color: #e879a6;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #d63384;
    }
  }
`;

const BusinessHours = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e879a6;
`;

const HoursTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;
`;

const HourItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

  .day {
    font-weight: 500;
    color: #2c3e50;
  }

  .hours {
    color: #6c757d;
    font-weight: 400;
  }
`;

const CTASection = styled(motion.section)`
  padding: 4rem 0;
  background: linear-gradient(135deg, #e879a6 0%, #d63384 100%);
  text-align: center;
  color: white;
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;
  color: white;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTASubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: white;
`;

const CTAButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #e879a6;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
`;

const SocialMediaSection = styled(motion.section)`
  padding: 4rem 0;
  background: white;
`;

const SocialMediaContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const SocialTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const SocialMediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 2rem;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const SocialIcon = styled(motion.a)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: white;
  font-size: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &.email {
    background: linear-gradient(135deg, #e879a6, #d63384);
  }

  &.facebook {
    background: linear-gradient(135deg, #3b5998, #8b9dc3);
  }

  &.instagram {
    background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  }

  &.linkedin {
    background: linear-gradient(135deg, #0077b5, #00a0dc);
  }

  &.yelp {
    background: linear-gradient(135deg, #d32323, #ff6666);
  }

  &.tiktok {
    background: linear-gradient(135deg, #000000, #ff0050, #00f2ea);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const Contact = () => {
  return (
    <Container>
      <HeroSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeroTitle>Contact Us</HeroTitle>
        <HeroSubtitle>
          Ready to transform your skin? We're here to help you achieve your skincare goals.
          Get in touch to schedule your consultation or ask any questions.
        </HeroSubtitle>
      </HeroSection>

      <ContactSection
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <ContactContainer>
          <ContactInfo>
            <BusinessName>OLGA SABO SKINCARE STUDIO</BusinessName>
            
            <ContactItem>
              <FiMapPin className="icon" size={24} />
              <ContactText>
                <h4>Studio Address</h4>
                <p>
                  18585 Monterey Rd Suite 140 / Studio 12<br />
                  Morgan Hill, California 95037<br />
                  United States
                </p>
              </ContactText>
            </ContactItem>

            <ContactItem>
              <FiPhone className="icon" size={24} />
              <ContactText>
                <h4>Phone</h4>
                <p>
                  <a href="tel:+18312330612">(831) 233-0612</a>
                </p>
              </ContactText>
            </ContactItem>

            <ContactItem>
              <FiMail className="icon" size={24} />
              <ContactText>
                <h4>Email</h4>
                <p>
                  <a href="mailto:olga.sabo.esthetics@gmail.com">
                    olga.sabo.esthetics@gmail.com
                  </a>
                </p>
              </ContactText>
            </ContactItem>
          </ContactInfo>

          <BusinessHours>
            <HoursTitle>
              <FiClock style={{ marginRight: '0.5rem' }} />
              Business Hours
            </HoursTitle>
            
            <HourItem>
              <span className="day">Monday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </HourItem>
            
            <HourItem>
              <span className="day">Tuesday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </HourItem>
            
            <HourItem>
              <span className="day">Wednesday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </HourItem>
            
            <HourItem>
              <span className="day">Thursday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </HourItem>
            
            <HourItem>
              <span className="day">Friday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </HourItem>
            
            <HourItem>
              <span className="day">Saturday</span>
              <span className="hours">10:00 AM - 4:00 PM</span>
            </HourItem>
            
            <HourItem>
              <span className="day">Sunday</span>
              <span className="hours">Closed</span>
            </HourItem>
          </BusinessHours>
        </ContactContainer>
      </ContactSection>

      <CTASection
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <CTAContainer>
          <CTATitle>Ready to Book Your Appointment?</CTATitle>
          <CTASubtitle>
            Experience the difference of professional skincare treatments. 
            Schedule your consultation today and begin your journey to healthier, more radiant skin.
          </CTASubtitle>
          <CTAButton
            href="/booking"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCalendar />
            Book Appointment
          </CTAButton>
        </CTAContainer>
      </CTASection>

      <SocialMediaSection
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <SocialMediaContainer>
          <SocialTitle>Connect With Us</SocialTitle>
          <SocialMediaGrid>
            <SocialIcon
              href="mailto:olga.sabo.esthetics@gmail.com"
              className="email"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiMail />
            </SocialIcon>
            
            <SocialIcon
              href="https://www.facebook.com/OlgaSaboSkincareStudio"
              target="_blank"
              rel="noopener noreferrer"
              className="facebook"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaFacebook />
            </SocialIcon>
            
            <SocialIcon
              href="https://www.instagram.com/olga.sabo.esthetics"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaInstagram />
            </SocialIcon>
            
            <SocialIcon
              href="https://www.linkedin.com/in/olga-sabo-esthetics"
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaLinkedin />
            </SocialIcon>
            
            <SocialIcon
              href="https://www.yelp.com/biz/olga-sabo-skincare-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="yelp"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaYelp />
            </SocialIcon>
            
            <SocialIcon
              href="https://www.tiktok.com/@olga.sabo.esthetics"
              target="_blank"
              rel="noopener noreferrer"
              className="tiktok"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTiktok />
            </SocialIcon>
          </SocialMediaGrid>
        </SocialMediaContainer>
      </SocialMediaSection>
    </Container>
  );
};

export default Contact; 