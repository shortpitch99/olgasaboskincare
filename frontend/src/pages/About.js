import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiShield, FiUsers, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaLinkedin, FaYelp, FaTiktok } from 'react-icons/fa';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fefcfe 0%, #fdf9fd 50%, #fcf7fc 100%);
  padding: 2rem 0;
`;

const AboutSection = styled.section`
  padding: 3rem 0 6rem 0;
  background: white;
`;

const AboutContainer = styled.div`
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
    text-align: center;
  }
`;

const AboutImage = styled(motion.div)`
  position: relative;
  margin-top: -2rem;
  
  img {
    width: 100%;
    height: 500px;
    object-fit: cover;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    margin-top: 0;
    img {
      height: 400px;
    }
  }
`;

const AboutContent = styled(motion.div)`
  h1 {
    font-size: 3rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 2rem;
    font-family: 'Calibri', 'Playfair Display', serif;
    font-stretch: condensed;

    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }

  h2 {
    font-size: 2.5rem;
    font-weight: 600;
    color: #e879a6;
    margin-bottom: 2rem;
    font-family: 'Calibri', 'Playfair Display', serif;
    font-stretch: condensed;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #555;
    margin-bottom: 2rem;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const Credentials = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 3rem;
`;

const CredentialItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  border-left: 4px solid #e879a6;

  .icon {
    color: #e879a6;
    flex-shrink: 0;
  }

  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
`;

const SocialMediaSection = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f4f8 0%, #f5f0f5 100%);
  border-top: 1px solid rgba(232, 121, 166, 0.1);
  margin-top: 2rem;
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
      font-size: 1.2rem;
    }
  }
`;

const ContactSection = styled(motion.section)`
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const ContactContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const ContactTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const ContactInfo = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e879a6;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const BusinessName = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #e879a6;
  margin-bottom: 2rem;
  font-family: 'Calibri', 'Inter', sans-serif;
  font-stretch: condensed;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f1f3f4 100%);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(232, 121, 166, 0.15);
  }

  .icon {
    color: #e879a6;
    flex-shrink: 0;
    margin-top: 0.2rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    
    .icon {
      margin-top: 0;
    }
  }
`;

const ContactText = styled.div`
  text-align: left;
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
    margin: 0;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
  }

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const SocialHandlesSection = styled(motion.section)`
  padding: 3rem 0 4rem 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
`;

const SocialHandlesContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const SocialHandlesTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 2rem;
  font-family: 'Calibri', 'Playfair Display', serif;
  font-stretch: condensed;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const HandlesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const HandleItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .platform {
    font-size: 1.1rem;
    font-weight: 600;
    color: #e879a6;
    margin-bottom: 0.5rem;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
  }

  .handle {
    font-size: 1rem;
    color: white;
    font-family: 'Calibri', 'Inter', sans-serif;
    font-stretch: condensed;
    word-break: break-word;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    
    .platform {
      font-size: 1rem;
    }
    
    .handle {
      font-size: 0.9rem;
    }
  }
`;

const About = () => {
  return (
    <Container>
      <AboutSection>
        <AboutContainer>
          <AboutImage
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src="https://be09f9939adcdf22f392.cdn6.editmysite.com/uploads/b/be09f9939adcdf22f392973be33fcca2c9c705ea99cae1c52f2b9ef02a95b3e9/2024-10-18_22-12-55_1729314825.jpg?width=800&dpr=1.3333333730697632"
              alt="Olga Sabo, Professional Skin Therapist"
            />
          </AboutImage>
          <AboutContent
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Meet Olga Sabo - Skin Therapist</h2>
            <p>
              I am a licensed esthetician and proud graduate of the prestigious Cinta Aveda Beauty Institute in San Jose, CA. Furthering my expertise, I pursued Advanced Esthetics and Clinical Esthetics education at the Concepts Institute of Advanced Esthetics in San Francisco, CA.
            </p>
            <p>
              This passion for knowledge hasn't stopped. As a Corrective Skincare Specialist, I am persistently growing to empower myself with the skills to perform the highly effective corrective treatments using the recent innovations in skincare technology, and to assist my clients in reaching their desired goals of wellness and beauty.
            </p>
            <p>
              Wellness is a timeless journey and I am dedicated to walking that path to beautifully healthy and radiant skin together. Throughout this journey, I provide the support and guidance essential for my clients. I am committed to perform targeted and effective treatments that cater to my clients specific skincare needs. I help to preserve, restore, and rejuvenate your unique beauty by customizing skincare treatments around each individual's skin. I've seen my clients gain remarkable results, boosting their beauty and health.
            </p>
            <p>
              I believe that each individual's journey is truly one of a kind. My goal is to empower as many people as possible to integrate wellness into their lives seamlessly, to achieve beauty and health.
            </p>
            <Credentials>
              <CredentialItem>
                <FiAward className="icon" size={24} />
                <div>
                  <h4>Licensed Esthetician</h4>
                  <p>Graduate of Cinta Aveda Beauty Institute, San Jose, CA</p>
                </div>
              </CredentialItem>
              <CredentialItem>
                <FiShield className="icon" size={24} />
                <div>
                  <h4>Advanced Clinical Training</h4>
                  <p>Concepts Institute of Advanced Esthetics, San Francisco, CA</p>
                </div>
              </CredentialItem>
              <CredentialItem>
                <FiUsers className="icon" size={24} />
                <div>
                  <h4>Corrective Skincare Specialist</h4>
                  <p>Dedicated to personalized wellness and beauty solutions</p>
                </div>
              </CredentialItem>
            </Credentials>
          </AboutContent>
        </AboutContainer>
      </AboutSection>

      <ContactSection
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <ContactContainer>
          <ContactTitle>Visit Our Studio</ContactTitle>
          <ContactInfo>
            <BusinessName>OLGA SABO SKINCARE STUDIO</BusinessName>
            
            <ContactItem>
              <FiMapPin className="icon" size={24} />
              <ContactText>
                <h4>Address</h4>
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
                <p>(831) 233 0612</p>
              </ContactText>
            </ContactItem>
          </ContactInfo>
        </ContactContainer>
      </ContactSection>

      <SocialMediaSection 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <SocialMediaTitle>Connect With Olga</SocialMediaTitle>
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

      <SocialHandlesSection
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <SocialHandlesContainer>
          <SocialHandlesTitle>Follow Us Online</SocialHandlesTitle>
          <HandlesList>
            <HandleItem>
              <div className="platform">Email</div>
              <div className="handle">olga.sabo.esthetics@gmail.com</div>
            </HandleItem>
            
            <HandleItem>
              <div className="platform">Facebook</div>
              <div className="handle">@OlgaSaboSkincareStudio</div>
            </HandleItem>
            
            <HandleItem>
              <div className="platform">Instagram</div>
              <div className="handle">@olga.sabo.esthetics</div>
            </HandleItem>
            
            <HandleItem>
              <div className="platform">LinkedIn</div>
              <div className="handle">Olga Sabo</div>
            </HandleItem>
            
            <HandleItem>
              <div className="platform">Yelp</div>
              <div className="handle">Olga Sabo Skincare Studio</div>
            </HandleItem>
            
            <HandleItem>
              <div className="platform">TikTok</div>
              <div className="handle">@olga.sabo.esthetics</div>
            </HandleItem>
          </HandlesList>
        </SocialHandlesContainer>
      </SocialHandlesSection>
    </Container>
  );
};

export default About;
