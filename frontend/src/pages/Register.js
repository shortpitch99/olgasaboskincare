import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const RegisterCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 500px;
  width: 100%;
`;

const Header = styled.div`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 3rem 2rem 2rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: white;
    border-radius: 20px 20px 0 0;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
`;

const FormContainer = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  padding-left: 3rem;
  border: 2px solid ${props => props.error ? '#e74c3c' : '#e9ecef'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#e74c3c' : 'var(--primary-color)'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(231, 76, 60, 0.1)' : 'rgba(139, 69, 19, 0.1)'};
  }
  
  ${props => props.success && `
    border-color: #27ae60;
    background: #f8fff8;
  `}
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: ${props => props.error ? '#e74c3c' : props.success ? '#27ae60' : 'var(--text-light)'};
  z-index: 1;
  transition: color 0.3s ease;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
`;

const StrengthBar = styled.div`
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const StrengthProgress = styled.div`
  height: 100%;
  background: ${props => {
    switch (props.strength) {
      case 1: return '#e74c3c';
      case 2: return '#f39c12';
      case 3: return '#f1c40f';
      case 4: return '#27ae60';
      default: return '#e9ecef';
    }
  }};
  width: ${props => (props.strength / 4) * 100}%;
  transition: all 0.3s ease;
`;

const StrengthText = styled.div`
  font-size: 0.8rem;
  color: var(--text-light);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StrengthItem = styled.span`
  color: ${props => props.met ? '#27ae60' : 'var(--text-light)'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 1rem 0;
  
  input {
    margin-top: 0.2rem;
    transform: scale(1.2);
    accent-color: var(--primary-color);
  }
  
  label {
    font-size: 0.9rem;
    color: var(--text-light);
    line-height: 1.4;
    cursor: pointer;
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  padding: 1.25rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
  
  p {
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Benefits = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const BenefitsTitle = styled.h4`
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.password
      });

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ submit: result.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Container>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <Title>Join Olga's Skincare</Title>
          <Subtitle>Create your account and start your skincare journey</Subtitle>
        </Header>

        <FormContainer>
          <Benefits>
            <BenefitsTitle>Why join us?</BenefitsTitle>
            <BenefitsList>
              <BenefitItem>
                <FiCheck color="#27ae60" />
                Easy online booking and appointment management
              </BenefitItem>
              <BenefitItem>
                <FiCheck color="#27ae60" />
                Exclusive access to premium skincare products
              </BenefitItem>
              <BenefitItem>
                <FiCheck color="#27ae60" />
                Personalized treatment recommendations
              </BenefitItem>
              <BenefitItem>
                <FiCheck color="#27ae60" />
                Special offers and member discounts
              </BenefitItem>
            </BenefitsList>
          </Benefits>

          <Form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label htmlFor="firstName">
                  <FiUser size={16} />
                  First Name *
                </Label>
                <InputContainer>
                  <InputIcon error={errors.firstName} success={formData.firstName && !errors.firstName}>
                    <FiUser />
                  </InputIcon>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    success={formData.firstName && !errors.firstName}
                    placeholder="Enter your first name"
                  />
                </InputContainer>
                {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="lastName">
                  <FiUser size={16} />
                  Last Name *
                </Label>
                <InputContainer>
                  <InputIcon error={errors.lastName} success={formData.lastName && !errors.lastName}>
                    <FiUser />
                  </InputIcon>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    success={formData.lastName && !errors.lastName}
                    placeholder="Enter your last name"
                  />
                </InputContainer>
                {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="email">
                <FiMail size={16} />
                Email Address *
              </Label>
              <InputContainer>
                <InputIcon error={errors.email} success={formData.email && !errors.email}>
                  <FiMail />
                </InputIcon>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  success={formData.email && !errors.email}
                  placeholder="Enter your email address"
                />
              </InputContainer>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">
                <FiPhone size={16} />
                Phone Number (Optional)
              </Label>
              <InputContainer>
                <InputIcon error={errors.phone} success={formData.phone && !errors.phone}>
                  <FiPhone />
                </InputIcon>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  success={formData.phone && !errors.phone}
                  placeholder="(555) 123-4567"
                />
              </InputContainer>
              {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">
                <FiLock size={16} />
                Password *
              </Label>
              <InputContainer>
                <InputIcon error={errors.password} success={formData.password && !errors.password}>
                  <FiLock />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  success={formData.password && !errors.password}
                  placeholder="Create a secure password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </InputContainer>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              
              {formData.password && (
                <PasswordStrength>
                  <StrengthBar>
                    <StrengthProgress strength={passwordStrength} />
                  </StrengthBar>
                  <StrengthText>
                    <StrengthItem met={formData.password.length >= 6}>
                      <FiCheck size={12} />
                      6+ characters
                    </StrengthItem>
                    <StrengthItem met={formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/)}>
                      <FiCheck size={12} />
                      Upper & lowercase
                    </StrengthItem>
                    <StrengthItem met={formData.password.match(/\d/)}>
                      <FiCheck size={12} />
                      Number
                    </StrengthItem>
                    <StrengthItem met={formData.password.match(/[^a-zA-Z\d]/)}>
                      <FiCheck size={12} />
                      Special character
                    </StrengthItem>
                  </StrengthText>
                </PasswordStrength>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">
                <FiLock size={16} />
                Confirm Password *
              </Label>
              <InputContainer>
                <InputIcon error={errors.confirmPassword} success={formData.confirmPassword && !errors.confirmPassword}>
                  <FiLock />
                </InputIcon>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  success={formData.confirmPassword && !errors.confirmPassword}
                  placeholder="Confirm your password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </InputContainer>
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>

            <TermsCheckbox>
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </TermsCheckbox>
            {errors.terms && <ErrorMessage>{errors.terms}</ErrorMessage>}
            {errors.submit && <ErrorMessage style={{ marginBottom: '1rem' }}>{errors.submit}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              <FiUser />
            </SubmitButton>
          </Form>

          <LoginLink>
            <p>Already have an account?</p>
            <Link to="/login">Sign in here</Link>
          </LoginLink>
        </FormContainer>
      </RegisterCard>
    </Container>
  );
};

export default Register; 