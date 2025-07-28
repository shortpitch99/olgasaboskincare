import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiHeart, FiArrowRight, FiCheck, FiLogIn, FiUserPlus, FiCreditCard, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  min-height: 70vh;
`;

const Header = styled.section`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
`;

const BookingSteps = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0 3rem 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, #e9ecef, #dee2e6);
    transform: translateY(-50%);
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    
    &::before {
      display: none;
    }
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  background: white;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid ${props => 
    props.completed ? '#6c757d' : 
    props.active ? 'var(--primary-color)' : '#e9ecef'
  };
  
  color: ${props => 
    props.completed ? '#495057' : 
    props.active ? 'var(--primary-color)' : '#6c757d'
  };
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -1rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => 
      props.completed ? '#6c757d' : 
      props.active ? 'var(--primary-color)' : '#dee2e6'
    };
    transform: translateY(-50%);
    z-index: 2;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .step-icon {
    font-size: 1.5rem;
    opacity: ${props => props.active || props.completed ? 1 : 0.6};
    color: ${props => 
      props.completed ? '#6c757d' : 
      props.active ? 'var(--primary-color)' : '#adb5bd'
    };
  }
  
  .step-label {
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.3;
    opacity: ${props => props.active || props.completed ? 1 : 0.7};
  }
  
  @media (max-width: 768px) {
    flex-direction: row;
    min-width: auto;
    width: 100%;
    padding: 1rem 1.5rem;
    
    &::before {
      display: none;
    }
    
    .step-icon {
      font-size: 1.25rem;
    }
    
    .step-label {
      font-size: 1rem;
      text-align: left;
    }
  }
`;

const BookingForm = styled(motion.div)`
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const StepContent = styled.div`
  padding: 2rem;
  min-height: 400px;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ServiceCard = styled.div`
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : '#e9ecef'};
  border-radius: 10px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f8f9ff' : 'white'};
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
`;

const ServiceName = styled.h4`
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`;

const ServiceDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-light);
`;

const ServicePrice = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.4;
  margin-top: 0.5rem;
`;

const DateTimeSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TimeSlots = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const TimeSlot = styled.button`
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : '#e9ecef'};
  background: ${props => props.selected ? 'var(--primary-color)' : 'white'};
  color: ${props => props.selected ? 'white' : 'var(--text-dark)'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    ${props => !props.selected && 'background: #f8f9ff;'}
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
    border-color: #e9ecef;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-dark);
  }
  
  input, textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
  
  textarea {
    height: 100px;
    resize: vertical;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
    transform: none;
  }
`;

const BookingSummary = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: var(--text-light);
`;

const AuthChoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 500px;
  margin: 0 auto;
`;

const AuthOptionCard = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  h4 {
    color: var(--text-dark);
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    color: var(--text-light);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
`;

const GuestFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GuestFormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-dark);
  }
  
  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    
    &::placeholder {
      color: #adb5bd;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const PaymentSection = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1rem;
  
  h4 {
    color: var(--text-dark);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SecurityNote = styled.p`
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
`;

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Guest booking states
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Separate payment info state
  const [paymentInfo, setPaymentInfo] = useState({
    creditCard: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  });
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Debug logging
  console.log('🔍 BookingPage Debug:', {
    isAuthenticated,
    user,
    currentStep,
    isGuestBooking,
    shouldShowAuthChoice: !isAuthenticated && !isGuestBooking && currentStep === 1,
    localStorage_token: localStorage.getItem('token')
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  // Handle service pre-selection from URL parameter
  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId && services.length > 0 && !selectedService) {
      const service = services.find(s => s.id === parseInt(serviceId));
      if (service) {
        setSelectedService(service);
        
        // Dynamic step progression based on authentication status
        if (isAuthenticated) {
          setCurrentStep(2); // Move to Date & Time selection for authenticated users
        } else if (isGuestBooking) {
          setCurrentStep(4); // Move to Date & Time selection for guest users
        } else {
          // For non-authenticated users, we need to show auth choice first
          // but then skip to date/time selection after they choose
          setCurrentStep(1); // Start at auth choice step
        }
        
        toast.success(`${service.name} selected! Please choose your preferred date and time.`);
      }
    }
  }, [searchParams, services, selectedService, isAuthenticated, isGuestBooking]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/bookings/availability/${selectedDate}`);
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    
    // Dynamic step progression based on authentication status
    if (isAuthenticated) {
      setCurrentStep(2); // Move to Date & Time selection for authenticated users
    } else if (isGuestBooking) {
      setCurrentStep(4); // Move to Date & Time selection for guest users
    } else {
      setCurrentStep(2); // For non-authenticated users who haven't chosen guest yet
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    
    // Dynamic step progression based on authentication status after time selection
    if (isAuthenticated) {
      setCurrentStep(3); // Move to Confirm for authenticated users
    } else if (isGuestBooking) {
      setCurrentStep(5); // Move to Payment for guest users
    } else {
      setCurrentStep(4); // Move to Confirm for non-authenticated non-guest users
    }
  };

  const handleGuestInfoChange = (field, value) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateGuestInfo = () => {
    const { firstName, lastName, email, phone } = guestInfo;
    return firstName && lastName && email && phone;
  };

  const validatePaymentInfo = () => {
    const { creditCard, expiryDate, cvv } = paymentInfo;
    return creditCard && expiryDate && cvv;
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please complete all booking details');
      return;
    }

    if (isGuestBooking && (!validateGuestInfo() || !validatePaymentInfo())) {
      toast.error('Please complete all required guest and payment information');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        service_id: selectedService.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes: notes.trim() || null
      };

      // Add guest information if booking as guest
      if (isGuestBooking) {
        bookingData.guest_info = guestInfo;
        bookingData.payment_info = paymentInfo;
      }

      const endpoint = isGuestBooking ? '/api/bookings/guest' : '/api/bookings';
      await axios.post(endpoint, bookingData);
      
      toast.success('Booking confirmed! We look forward to seeing you.');
      
      if (isAuthenticated) {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months from now
    return maxDate.toISOString().split('T')[0];
  };

  const getTotalSteps = () => {
    if (isAuthenticated) {
      return 3; // Service, Date/Time, Confirm
    } else {
      return isGuestBooking ? 6 : 4; // Auth choice, Service, Date/Time, Confirm (or) Auth choice, Guest info, Service, Date/Time, Payment, Confirm
    }
  };

  const getStepLabel = (stepNum) => {
    if (isAuthenticated) {
      switch (stepNum) {
        case 1: return 'Choose Service';
        case 2: return 'Select Date & Time';
        case 3: return 'Confirm Booking';
        default: return '';
      }
    } else {
      if (isGuestBooking) {
        switch (stepNum) {
          case 1: return 'Login or Continue';
          case 2: return 'Guest Information';
          case 3: return 'Choose Service';
          case 4: return 'Select Date & Time';
          case 5: return 'Payment Information';
          case 6: return 'Confirm Booking';
          default: return '';
        }
      } else {
        switch (stepNum) {
          case 1: return 'Login or Continue';
          case 2: return 'Choose Service';
          case 3: return 'Select Date & Time';
          case 4: return 'Confirm Booking';
          default: return '';
        }
      }
    }
  };

  const getStepIcon = (stepNum) => {
    if (isAuthenticated) {
      switch (stepNum) {
        case 1: return <FiHeart />;
        case 2: return <FiCalendar />;
        case 3: return <FiCheck />;
        default: return null;
      }
    } else {
      if (isGuestBooking) {
        switch (stepNum) {
          case 1: return <FiLogIn />;
          case 2: return <FiUser />;
          case 3: return <FiHeart />;
          case 4: return <FiCalendar />;
          case 5: return <FiCreditCard />;
          case 6: return <FiCheck />;
          default: return null;
        }
      } else {
        switch (stepNum) {
          case 1: return <FiLogIn />;
          case 2: return <FiHeart />;
          case 3: return <FiCalendar />;
          case 4: return <FiCheck />;
          default: return null;
        }
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title>Book Your Appointment</Title>
        <Subtitle>
          Choose your preferred service, date, and time for your personalized skincare experience.
        </Subtitle>
      </Header>

      <BookingSteps>
        {Array.from({ length: getTotalSteps() }, (_, index) => {
          const stepNum = index + 1;
          return (
            <Step 
              key={stepNum}
              active={currentStep === stepNum} 
              completed={currentStep > stepNum}
            >
              <div className="step-icon">
                {getStepIcon(stepNum)}
              </div>
              <div className="step-label">
                {getStepLabel(stepNum)}
              </div>
            </Step>
          );
        })}
      </BookingSteps>

      

      <BookingForm
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StepContent>
          {/* Authentication Choice Step (Non-authenticated users only) */}
          {!isAuthenticated && !isGuestBooking && currentStep === 1 && (
            <>
              <StepTitle>
                <FiLogIn />
                How would you like to proceed?
              </StepTitle>

              <AuthChoiceContainer>
                <AuthOptionCard onClick={() => navigate('/login')}>
                  <h4><FiLogIn /> Login to Your Account</h4>
                  <p>Access your booking history, preferences, and enjoy a faster checkout experience.</p>
                  <Button className="primary">
                    Login
                  </Button>
                </AuthOptionCard>
                
                <AuthOptionCard onClick={() => {
                  setIsGuestBooking(true);
                  // If service is pre-selected, skip to guest info step
                  // Otherwise start at guest info step normally
                  setCurrentStep(2);
                }}>
                  <h4><FiUserPlus /> Continue as Guest</h4>
                  <p>Book quickly without creating an account. We'll collect your information for this appointment.</p>
                  <Button className="secondary">
                    Continue as Guest
                  </Button>
                </AuthOptionCard>
              </AuthChoiceContainer>
            </>
          )}

          {/* Guest Information Step */}
          {!isAuthenticated && isGuestBooking && currentStep === 2 && (
            <>
              <StepTitle>
                <FiUser />
                Your Information
              </StepTitle>
              <GuestFormGrid>
                <GuestFormGroup>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={guestInfo.firstName}
                    onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </GuestFormGroup>
                
                <GuestFormGroup>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={guestInfo.lastName}
                    onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </GuestFormGroup>
              </GuestFormGrid>

              <GuestFormGrid>
                <GuestFormGroup>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </GuestFormGroup>
                
                <GuestFormGroup>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </GuestFormGroup>
              </GuestFormGrid>
            </>
          )}



          {/* Service Selection Step */}
          {((isAuthenticated && currentStep === 1) || (!isAuthenticated && isGuestBooking && currentStep === 3) || (!isAuthenticated && !isGuestBooking && currentStep === 2)) && (
            <>
              <StepTitle>
                <FiHeart />
                Choose Your Service
              </StepTitle>
              <ServicesGrid>
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    selected={selectedService?.id === service.id}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <ServiceName>{service.name}</ServiceName>
                    <ServiceDetails>
                      <span>{service.duration} minutes</span>
                      <ServicePrice>${service.price}</ServicePrice>
                    </ServiceDetails>
                    <ServiceDescription>{service.description}</ServiceDescription>
                  </ServiceCard>
                ))}
              </ServicesGrid>
            </>
          )}

          {/* Date & Time Selection Step */}
          {((isAuthenticated && currentStep === 2) || (!isAuthenticated && isGuestBooking && currentStep === 4) || (!isAuthenticated && !isGuestBooking && currentStep === 3)) && selectedService && (
            <>
              <StepTitle>
                <FiCalendar />
                Select Date & Time
              </StepTitle>
              <DateTimeSection>
                <div>
                  <h4>Choose Date</h4>
                  <DateInput
                    id="selectedDate"
                    name="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={getTomorrowDate()}
                    max={getMaxDate()}
                  />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    Selected service: <strong>{selectedService.name}</strong>
                  </p>
                </div>
                <div>
                  <h4>Available Times</h4>
                  {loading ? (
                    <LoadingSpinner>Loading available times...</LoadingSpinner>
                  ) : selectedDate ? (
                    <TimeSlots>
                      {availableSlots.length > 0 ? (
                        availableSlots.map(slot => (
                          <TimeSlot
                            key={slot}
                            selected={selectedTime === slot}
                            onClick={() => handleTimeSelect(slot)}
                          >
                            {slot}
                          </TimeSlot>
                        ))
                      ) : (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-light)' }}>
                          No available times for this date
                        </p>
                      )}
                    </TimeSlots>
                  ) : (
                    <p style={{ color: 'var(--text-light)' }}>
                      Please select a date first
                    </p>
                  )}
                </div>
              </DateTimeSection>
            </>
          )}

          {/* Payment Information Step (Guest users only) */}
          {!isAuthenticated && isGuestBooking && currentStep === 5 && (
            <>
              <StepTitle>
                <FiCreditCard />
                Payment Information
              </StepTitle>
              <PaymentSection>
                <GuestFormGrid>
                  <GuestFormGroup>
                    <label htmlFor="creditCard">Credit Card Number *</label>
                    <input
                      id="creditCard"
                      name="creditCard"
                      type="text"
                      value={paymentInfo.creditCard}
                      onChange={(e) => handlePaymentInfoChange('creditCard', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </GuestFormGroup>
                  
                  <GuestFormGroup>
                    <label htmlFor="expiryDate">Expiry Date *</label>
                    <input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      pattern="[0-9]{2}/[0-9]{2}"
                      required
                    />
                  </GuestFormGroup>
                </GuestFormGrid>

                <GuestFormGrid>
                  <GuestFormGroup>
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => handlePaymentInfoChange('cvv', e.target.value)}
                      placeholder="123"
                      pattern="[0-9]{3,4}"
                      required
                    />
                  </GuestFormGroup>
                  
                  <GuestFormGroup>
                    <label htmlFor="billingAddress">Billing Address</label>
                    <input
                      id="billingAddress"
                      name="billingAddress"
                      type="text"
                      value={paymentInfo.billingAddress}
                      onChange={(e) => handlePaymentInfoChange('billingAddress', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </GuestFormGroup>
                </GuestFormGrid>

                <SecurityNote>
                  <FiShield style={{ marginRight: '0.5rem' }} />
                  Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                </SecurityNote>
              </PaymentSection>
            </>
          )}

          {/* Confirmation Step */}
          {((isAuthenticated && currentStep === 3) || (!isAuthenticated && isGuestBooking && currentStep === 6) || (!isAuthenticated && !isGuestBooking && currentStep === 4)) && selectedService && selectedDate && selectedTime && (
            <>
              <StepTitle>
                <FiCheck />
                Confirm Your Booking
              </StepTitle>
              
              <BookingSummary>
                <SummaryItem>
                  <span>Service:</span>
                  <span>{selectedService.name}</span>
                </SummaryItem>
                <SummaryItem>
                  <span>Date:</span>
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </SummaryItem>
                <SummaryItem>
                  <span>Time:</span>
                  <span>{selectedTime}</span>
                </SummaryItem>
                <SummaryItem>
                  <span>Duration:</span>
                  <span>{selectedService.duration} minutes</span>
                </SummaryItem>
                <SummaryItem>
                  <span>Total:</span>
                  <span>${selectedService.price}</span>
                </SummaryItem>
              </BookingSummary>

              <FormGroup>
                <label htmlFor="notes">Special Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or information we should know..."
                />
              </FormGroup>
            </>
          )}
        </StepContent>

        <NavigationButtons>
          <Button
            className="secondary"
            onClick={() => {
              if (!isAuthenticated && isGuestBooking && currentStep === 2) {
                // Going back from guest info to auth choice
                setIsGuestBooking(false);
                setCurrentStep(1);
              } else if (!isAuthenticated && isGuestBooking && currentStep === 4 && selectedService) {
                // Going back from Date/Time to Guest Info (skipping service selection if service was pre-selected)
                setCurrentStep(2);
              } else {
                setCurrentStep(Math.max(1, currentStep - 1));
              }
            }}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          {currentStep < getTotalSteps() ? (
            <Button
              className="primary"
              disabled={
                // Auth choice step (no conditions)
                (!isAuthenticated && !isGuestBooking && currentStep === 1) ? false :
                // Guest info step
                (!isAuthenticated && isGuestBooking && currentStep === 2) ? !validateGuestInfo() :
                // Service selection step
                ((isAuthenticated && currentStep === 1) || (!isAuthenticated && isGuestBooking && currentStep === 3) || (!isAuthenticated && !isGuestBooking && currentStep === 2)) ? !selectedService :
                // Date/time selection step
                ((isAuthenticated && currentStep === 2) || (!isAuthenticated && isGuestBooking && currentStep === 4) || (!isAuthenticated && !isGuestBooking && currentStep === 3)) ? (!selectedDate || !selectedTime) :
                // Payment info step
                (!isAuthenticated && isGuestBooking && currentStep === 5) ? !validatePaymentInfo() :
                false
              }
              onClick={() => {
                // Handle step progression based on current flow
                if (!isAuthenticated && !isGuestBooking && currentStep === 1) {
                  // This shouldn't happen as auth choice doesn't use next button
                  return;
                } else if (!isAuthenticated && isGuestBooking && currentStep === 2) {
                  // Guest info -> Service selection or Date/Time (if service already selected)
                  if (selectedService) {
                    setCurrentStep(4); // Skip service selection, go to Date/Time
                  } else {
                    setCurrentStep(3); // Go to Service selection
                  }
                } else if ((isAuthenticated && currentStep === 1) || (!isAuthenticated && isGuestBooking && currentStep === 3) || (!isAuthenticated && !isGuestBooking && currentStep === 2)) {
                  // Service selection -> Date/time
                  if (isAuthenticated) {
                    setCurrentStep(2);
                  } else if (isGuestBooking) {
                    setCurrentStep(4);
                  } else {
                    setCurrentStep(3);
                  }
                } else if ((isAuthenticated && currentStep === 2) || (!isAuthenticated && isGuestBooking && currentStep === 4) || (!isAuthenticated && !isGuestBooking && currentStep === 3)) {
                  // Date/time -> Payment (guests) or Confirmation (authenticated/non-guest)
                  if (isAuthenticated) {
                    setCurrentStep(3);
                  } else if (isGuestBooking) {
                    setCurrentStep(5);
                  } else {
                    setCurrentStep(4);
                  }
                } else if (!isAuthenticated && isGuestBooking && currentStep === 5) {
                  // Payment -> Confirmation
                  setCurrentStep(6);
                }
              }}
            >
              Next Step
              <FiArrowRight />
            </Button>
          ) : (
            <Button
              className="primary"
              onClick={handleSubmitBooking}
              disabled={submitting || (isGuestBooking && (!validateGuestInfo() || !validatePaymentInfo()))}
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
              <FiCheck />
            </Button>
          )}
        </NavigationButtons>
      </BookingForm>
    </Container>
  );
};

export default BookingPage; 