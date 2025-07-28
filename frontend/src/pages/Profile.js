import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiClock, FiEdit, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
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
  font-size: 1.1rem;
  color: var(--text-light);
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  
  label {
    font-weight: 500;
    color: var(--text-dark);
  }
  
  span {
    color: var(--text-light);
  }
`;

const BookingsSection = styled.div`
  h4 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    color: var(--text-dark);
  }
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
`;

const BookingCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const BookingInfo = styled.div`
  h5 {
    margin-bottom: 0.5rem;
    color: var(--text-dark);
    font-size: 1.1rem;
  }
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-light);
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'confirmed':
        return 'background: #d4edda; color: #155724;';
      case 'completed':
        return 'background: #cce5ff; color: #004085;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #fff3cd; color: #856404;';
    }
  }}
`;

const BookingActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-dark);
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const BookNowButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  
  h4 {
    margin-bottom: 0.5rem;
    color: var(--text-dark);
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

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const canCancelBooking = (appointmentDate, appointmentTime) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDiff / (1000 * 3600);
    
    return hoursUntilAppointment > 24; // Can cancel if more than 24 hours away
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Header>
          <Title>Please Log In</Title>
          <Subtitle>You need to be logged in to view your profile</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Profile</Title>
        <Subtitle>Manage your account and view your booking history</Subtitle>
      </Header>

      <ProfileGrid>
        <ProfileCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle>
            <FiUser />
            Account Information
          </SectionTitle>
          <UserInfo>
            <InfoItem>
              <label>Name:</label>
              <span>{user?.firstName} {user?.lastName}</span>
            </InfoItem>
            <InfoItem>
              <label>Email:</label>
              <span>{user?.email}</span>
            </InfoItem>
            <InfoItem>
              <label>Phone:</label>
              <span>{user?.phone || 'Not provided'}</span>
            </InfoItem>
            <InfoItem>
              <label>Member Since:</label>
              <span>{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
            </InfoItem>
          </UserInfo>
          <BookNowButton to="/booking">
            <FiPlus />
            Book New Appointment
          </BookNowButton>
        </ProfileCard>

        <ProfileCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BookingsSection>
            <SectionTitle>
              <FiCalendar />
              My Bookings
            </SectionTitle>

            {loading ? (
              <LoadingSpinner>Loading your bookings...</LoadingSpinner>
            ) : bookings.length === 0 ? (
              <EmptyState>
                <h4>No Bookings Yet</h4>
                <p>You haven't made any appointments yet. Book your first appointment to get started!</p>
                <BookNowButton to="/booking" style={{ display: 'inline-flex', marginTop: '1rem' }}>
                  <FiPlus />
                  Book Your First Appointment
                </BookNowButton>
              </EmptyState>
            ) : (
              <BookingsList>
                {bookings.map(booking => (
                  <BookingCard key={booking.id}>
                    <BookingHeader>
                      <BookingInfo>
                        <h5>{booking.service_name}</h5>
                        <StatusBadge status={booking.status}>
                          {booking.status}
                        </StatusBadge>
                      </BookingInfo>
                    </BookingHeader>

                    <BookingDetails>
                      <DetailItem>
                        <FiCalendar size={14} />
                        {formatDate(booking.appointment_date)}
                      </DetailItem>
                      <DetailItem>
                        <FiClock size={14} />
                        {formatTime(booking.appointment_time)}
                      </DetailItem>
                      <DetailItem>
                        <span>Duration: {booking.duration} min</span>
                      </DetailItem>
                      <DetailItem>
                        <span>Total: ${booking.total_amount}</span>
                      </DetailItem>
                    </BookingDetails>

                    {booking.notes && (
                      <div style={{ 
                        marginBottom: '1rem', 
                        padding: '0.75rem', 
                        background: '#f8f9fa', 
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: 'var(--text-light)'
                      }}>
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <BookingActions>
                        {canCancelBooking(booking.appointment_date, booking.appointment_time) ? (
                          <ActionButton
                            className="danger"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <FiX />
                            Cancel Booking
                          </ActionButton>
                        ) : (
                          <ActionButton disabled>
                            <FiX />
                            Cannot Cancel (Less than 24h)
                          </ActionButton>
                        )}
                      </BookingActions>
                    )}
                  </BookingCard>
                ))}
              </BookingsList>
            )}
          </BookingsSection>
        </ProfileCard>
      </ProfileGrid>
    </Container>
  );
};

export default Profile; 