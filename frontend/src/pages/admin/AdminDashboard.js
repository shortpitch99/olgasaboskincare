import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import { FiCalendar, FiClock, FiUser, FiX, FiPlus, FiEdit, FiTrash2, FiFilter, FiMessageSquare, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2rem;
  min-height: 70vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
  }
  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #ecf0f1;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? '#3498db' : 'transparent'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? '#3498db' : '#f8f9fa'};
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Form = styled.form`
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  p {
    margin-bottom: 1rem;
    color: #7f8c8d;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return '#e74c3c';
    if (props.variant === 'secondary') return '#6c757d';
    if (props.variant === 'success') return '#27ae60';
    return '#3498db';
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => {
      if (props.variant === 'danger') return '#c0392b';
      if (props.variant === 'secondary') return '#5a6268';
      if (props.variant === 'success') return '#229954';
      return '#2980b9';
    }};
    transform: translateY(-2px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }

  th {
    background: #34495e;
    color: white;
    font-weight: 600;
  }

  tr:hover {
    background: #f8f9fa;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Modal = styled.div`
  display: ${props => props.show !== undefined ? (props.show ? 'flex' : 'none') : 'flex'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;

  h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;

  h3 {
    margin: 0;
    color: #2c3e50;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem 2rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#8e0a3a'; // Dark pink text for light background
      case 'confirmed':
        return 'white';
      case 'completed':
        return 'white';
      case 'cancelled':
        return '#8e0a3a'; // Dark pink text for light background
      default:
        return 'white';
    }
  }};
  background-color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#f8b2c4'; // Light pink
      case 'confirmed':
        return '#f48fb1'; // Medium pink
      case 'completed':
        return '#e91e63'; // Dark pink
      case 'cancelled':
        return '#f5c6cb'; // Very light pink
      default:
        return '#f06292'; // Default pink
    }
  }};
`;

const BookingFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  h3 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ClientInfo = styled.div`
  strong {
    display: block;
    font-size: 1.1rem;
    color: #2c3e50;
  }
  small {
    font-size: 0.9rem;
    color: #7f8c8d;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.4rem;
  }
  
  p {
    color: #7f8c8d;
    margin: 0;
    font-size: 0.9rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  border: 1px solid #e9ecef;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Calendar Styled Components
const CalendarContainer = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CalendarHeader = styled.div`
  background: #f8f9fa;
  color: #333;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: #333;
  }
`;

const CalendarControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CalendarViewToggle = styled.div`
  display: flex;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#dee2e6'};
  }
`;

const CalendarNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #666;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #dee2e6;
    color: #333;
  }
`;

const CalendarTitle = styled.h4`
  margin: 0;
  font-size: 1.2rem;
  min-width: 200px;
  text-align: center;
  color: #333;
  font-weight: 600;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const CalendarDay = styled.div`
  min-height: 120px;
  border: 1px solid #e9ecef;
  padding: 0.5rem;
  background: ${props => props.isToday ? '#f8f9fa' : props.isOtherMonth ? '#fafafa' : 'white'};
  color: ${props => props.isOtherMonth ? '#bdc3c7' : '#2c3e50'};
  position: relative;
  cursor: pointer;
  
  &:hover {
    background: #f1f2f6;
  }
`;

const DayNumber = styled.div`
  font-weight: ${props => props.isToday ? 'bold' : 'normal'};
  color: ${props => props.isToday ? '#3498db' : 'inherit'};
  margin-bottom: 0.25rem;
`;

const BookingItem = styled.div`
  background: ${props => getBookingColor(props.status)};
  color: white;
  padding: 0.2rem 0.4rem;
  margin-bottom: 0.2rem;
  border-radius: 3px;
  font-size: 0.7rem;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    opacity: 0.8;
  }
`;

// Day View Styled Components
const DayView = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const DayHeader = styled.div`
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const DayTimeSlots = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const TimeSlot = styled.div`
  display: flex;
  border-bottom: 1px solid #e9ecef;
  min-height: 60px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TimeLabel = styled.div`
  width: 80px;
  padding: 1rem 0.75rem;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6c757d;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimeSlotContent = styled.div`
  flex: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CalendarLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
`;

const BookingDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const BookingDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  strong {
    color: #2c3e50;
    font-size: 0.9rem;
  }
  
  span {
    color: #7f8c8d;
  }
`;

// Helper function for booking colors
const getBookingColor = (status) => {
  switch (status) {
    case 'pending': return '#f8b2c4';      // Light pink
    case 'confirmed': return '#f48fb1';    // Medium pink
    case 'completed': return '#e91e63';    // Dark pink
    case 'cancelled': return '#f5c6cb';    // Very light pink
    default: return '#f06292';             // Default pink
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('services');
  
  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState({
    name: '',
    system_prompt: '',
    welcome_message: ''
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [chatPagination, setChatPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Invoice states
  const [invoices, setInvoices] = useState([]);
  const [invoicePagination, setInvoicePagination] = useState({ page: 1, pages: 1, total: 0 });
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [invoiceStats, setInvoiceStats] = useState({
    total_invoices: 0,
    pending_invoices: 0,
    paid_invoices: 0,
    cancelled_invoices: 0,
    total_revenue: 0,
    pending_amount: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [createInvoiceForm, setCreateInvoiceForm] = useState({
    user_id: '',
    customer_email: '',
    customer_name: '',
    items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }],
    notes: ''
  });
  const [editInvoiceForm, setEditInvoiceForm] = useState({
    id: '',
    customer_name: '',
    customer_email: '',
    user_id: '',
    due_date: '',
    notes: '',
    items: [{ item_type: 'service', item_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }]
  });
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);
  const [useExistingCustomerEdit, setUseExistingCustomerEdit] = useState(true);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', duration: '', price: '', category: '', benefits: '', image_url: ''
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', brand: '', stock_quantity: '', image_url: ''
  });

  // Booking filters
  const [bookingFilters, setBookingFilters] = useState({
    date: '',
    status: ''
  });

  // Calendar blocking form
  const [blockForm, setBlockForm] = useState({
    block_date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });

  // Display management state
  const [servicesDisplayChanges, setServicesDisplayChanges] = useState({});
  const [productsDisplayChanges, setProductsDisplayChanges] = useState({});

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Calendar helper functions
  const formatCalendarTitle = (date, view) => {
    if (view === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else { // day view
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else { // day view
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.appointment_date === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date, currentDate) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  // Calendar Components
  const MonthCalendar = ({ currentDate, bookings, onBookingClick }) => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
    const endOfCalendar = new Date(endOfMonth);
    endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));

    const days = [];
    const current = new Date(startOfCalendar);
    
    while (current <= endOfCalendar) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <CalendarGrid>
          {dayNames.map(day => (
            <div key={day} style={{ 
              padding: '0.75rem', 
              background: '#f8f9fa', 
              border: '1px solid #e9ecef',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayBookings = getBookingsForDate(day);
            return (
              <CalendarDay
                key={day.toISOString()}
                isToday={isToday(day)}
                isOtherMonth={!isSameMonth(day, currentDate)}
              >
                <DayNumber isToday={isToday(day)}>
                  {day.getDate()}
                </DayNumber>
                {dayBookings.map(booking => (
                  <BookingItem
                    key={booking.id}
                    status={booking.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(booking);
                    }}
                    title={`${booking.appointment_time} - ${booking.service_name} (${booking.first_name} ${booking.last_name})`}
                  >
                    {booking.appointment_time} {booking.service_name}
                  </BookingItem>
                ))}
              </CalendarDay>
            );
          })}
        </CalendarGrid>
      </div>
    );
  };

  const WeekCalendar = ({ currentDate, bookings, onBookingClick }) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
      <CalendarGrid>
        {days.map((day, index) => {
          const dayBookings = getBookingsForDate(day);
          return (
            <CalendarDay
              key={day.toISOString()}
              isToday={isToday(day)}
              style={{ minHeight: '200px' }}
            >
              <div style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 'bold', color: '#6c757d', fontSize: '0.8rem' }}>
                  {dayNames[index]}
                </div>
                <DayNumber isToday={isToday(day)} style={{ fontSize: '1.2rem' }}>
                  {day.getDate()}
                </DayNumber>
              </div>
              {dayBookings.map(booking => (
                <BookingItem
                  key={booking.id}
                  status={booking.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick(booking);
                  }}
                  style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}
                  title={`${booking.appointment_time} - ${booking.service_name} (${booking.first_name} ${booking.last_name})`}
                >
                  <div>{booking.appointment_time}</div>
                  <div>{booking.service_name}</div>
                  <div>{booking.first_name} {booking.last_name}</div>
                </BookingItem>
              ))}
            </CalendarDay>
          );
        })}
      </CalendarGrid>
    );
  };

  const DayCalendar = ({ currentDate, bookings, onBookingClick }) => {
    const dayBookings = getBookingsForDate(currentDate);
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeSlots = [];
    
    // Generate time slots from 8 AM to 6 PM
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push(time);
      }
    }

    return (
      <DayView>
        <DayHeader>
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px 8px 0 0',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#495057'
          }}>
            {dayName} - {currentDate.getDate()}
          </div>
        </DayHeader>
        <DayTimeSlots>
          {timeSlots.map(timeSlot => {
            const slotBookings = dayBookings.filter(booking => 
              booking.appointment_time === timeSlot
            );
            
            return (
              <TimeSlot key={timeSlot}>
                <TimeLabel>{timeSlot}</TimeLabel>
                <TimeSlotContent>
                  {slotBookings.length > 0 ? (
                    slotBookings.map(booking => (
                      <BookingItem
                        key={booking.id}
                        status={booking.status}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick(booking);
                        }}
                        style={{ 
                          width: '100%',
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.9rem'
                        }}
                        title={`${booking.service_name} - ${booking.first_name} ${booking.last_name}`}
                      >
                        <div style={{ fontWeight: 'bold' }}>{booking.service_name}</div>
                        <div>{booking.first_name} {booking.last_name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                          {booking.duration} min - ${booking.total_amount}
                        </div>
                      </BookingItem>
                    ))
                  ) : (
                    <div style={{ 
                      color: '#adb5bd', 
                      fontStyle: 'italic',
                      fontSize: '0.8rem'
                    }}>
                      Available
                    </div>
                  )}
                </TimeSlotContent>
              </TimeSlot>
            );
          })}
        </DayTimeSlots>
      </DayView>
    );
  };

  // Display management functions
  const updateServiceDisplay = (serviceId, field, value) => {
    setServicesDisplayChanges(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));

    // Update local state immediately for UI responsiveness
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, [field]: value }
        : service
    ));
  };

  const updateProductDisplay = (productId, field, value) => {
    setProductsDisplayChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));

    // Update local state immediately for UI responsiveness
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, [field]: value }
        : product
    ));
  };

  const saveServicesDisplaySettings = async () => {
    if (Object.keys(servicesDisplayChanges).length === 0) {
      toast.info('No changes to save');
      return;
    }

    setLoading(true);
    try {
      console.log('Saving services display changes:', servicesDisplayChanges);
      
      const promises = Object.entries(servicesDisplayChanges).map(([serviceId, changes]) => {
        // Ensure proper data types
        const sanitizedChanges = {};
        
        if (changes.is_displayed !== undefined) {
          sanitizedChanges.is_displayed = Boolean(changes.is_displayed);
        }
        
        if (changes.display_order !== undefined) {
          sanitizedChanges.display_order = parseInt(changes.display_order);
        }
        
        console.log(`Updating service ${serviceId} with changes:`, sanitizedChanges);
        return axios.put(`/api/services/admin/${serviceId}/display`, sanitizedChanges, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      });

      await Promise.all(promises);
      
      toast.success('Services display settings saved successfully!');
      setServicesDisplayChanges({});
      fetchServices(); // Refresh data
    } catch (error) {
      console.error('Error saving services display settings:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error('Failed to save services display settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProductsDisplaySettings = async () => {
    if (Object.keys(productsDisplayChanges).length === 0) {
      toast.info('No changes to save');
      return;
    }

    setLoading(true);
    try {
      const promises = Object.entries(productsDisplayChanges).map(([productId, changes]) => {
        // Ensure proper data types
        const sanitizedChanges = {};
        
        if (changes.is_displayed !== undefined) {
          sanitizedChanges.is_displayed = Boolean(changes.is_displayed);
        }
        
        if (changes.display_order !== undefined) {
          sanitizedChanges.display_order = parseInt(changes.display_order);
        }
        
        return axios.put(`/api/products/admin/${productId}/display`, sanitizedChanges, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      });

      await Promise.all(promises);
      
      toast.success('Products display settings saved successfully!');
      setProductsDisplayChanges({});
      fetchProducts(); // Refresh data
    } catch (error) {
      console.error('Error saving products display settings:', error);
      toast.error('Failed to save products display settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/admin/users?limit=100');
      console.log('Customers API response:', response.data);
      
      // The API returns { users: [...], pagination: {...} }
      if (response.data && Array.isArray(response.data.users)) {
        setCustomers(response.data.users);
      } else if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        console.warn('Unexpected customers data format:', response.data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Keep customers as empty array on error
      setCustomers([]);
      
      // Provide more specific error message
      if (error.response?.status === 401) {
        toast.error('Authentication required to load customers');
      } else if (error.response?.status === 403) {
        toast.error('Admin access required to load customers');
      } else {
        toast.error('Failed to load customers');
      }
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (bookingFilters.date) params.append('date', bookingFilters.date);
      if (bookingFilters.status) params.append('status', bookingFilters.status);
      
      const response = await axios.get(`/api/bookings/admin/all?${params}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [bookingFilters.date, bookingFilters.status]);

  useEffect(() => {
    fetchServices();
    fetchProducts();
    if (activeTab === 'bookings' || activeTab === 'booking-calendar') {
      fetchBookings();
    }
    if (activeTab === 'calendar') {
      fetchBlockedSlots();
    }
    if (activeTab === 'invoices') {
      fetchCustomers(); // Load customers when invoice tab is opened
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBlockedSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings/admin/blocked-slots');
      setBlockedSlots(response.data);
    } catch (error) {
      console.error('Error fetching blocked slots:', error);
      // Don't show error toast if endpoint doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`/api/services/${editItem.id}`, serviceForm);
        toast.success('Service updated successfully!');
        setEditMode(false);
        setEditItem(null);
        setShowModal(false);
      } else {
        await axios.post('/api/services', serviceForm);
        toast.success('Service added successfully!');
      }
      setServiceForm({ name: '', description: '', duration: '', price: '', category: '', benefits: '', image_url: '' });
      fetchServices();
    } catch (error) {
      toast.error(editMode ? 'Error updating service' : 'Error adding service');
    }
    setLoading(false);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`/api/products/${editItem.id}`, productForm);
        toast.success('Product updated successfully!');
        setEditMode(false);
        setEditItem(null);
        setShowModal(false);
      } else {
        await axios.post('/api/products', productForm);
        toast.success('Product added successfully!');
      }
      setProductForm({ name: '', description: '', price: '', category: '', brand: '', stock_quantity: '', image_url: '' });
      fetchProducts();
    } catch (error) {
      toast.error(editMode ? 'Error updating product' : 'Error adding product');
    }
    setLoading(false);
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/bookings/admin/block-slot', blockForm);
      toast.success('Time slot blocked successfully!');
      setBlockForm({ block_date: '', start_time: '', end_time: '', reason: '' });
      fetchBlockedSlots();
    } catch (error) {
      toast.error('Error blocking time slot');
    }
    setLoading(false);
  };

  const handleDeleteBlockedSlot = async (id) => {
    if (window.confirm('Are you sure you want to unblock this time slot?')) {
      try {
        await axios.delete(`/api/bookings/admin/blocked-slots/${id}`);
        toast.success('Time slot unblocked successfully!');
        fetchBlockedSlots();
      } catch (error) {
        toast.error('Error unblocking time slot');
      }
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      console.log('Updating booking status:', { bookingId, newStatus });
      const response = await axios.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      console.log('Booking status update response:', response.data);
      toast.success(`Booking ${newStatus} successfully!`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Error updating booking status');
    }
  };

  const handleCheckout = async (bookingId) => {
    try {
      console.log('Starting checkout process for booking:', bookingId);
      
      // Step 1: Complete the booking
      await updateBookingStatus(bookingId, 'completed');
      
      // Step 2: Create invoice
      await createInvoiceFromBooking(bookingId);
      
      toast.success('Checkout completed! Booking marked as completed and invoice created.');
    } catch (error) {
      console.error('Error during checkout process:', error);
      toast.error('Error during checkout process. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditItem(item);
    setShowModal(true);
    
    if (activeTab === 'services') {
      setServiceForm({
        name: item.name,
        description: item.description,
        duration: item.duration.toString(),
        price: item.price.toString(),
        category: item.category,
        benefits: item.benefits || '',
        image_url: item.image_url || ''
      });
    } else if (activeTab === 'products') {
      setProductForm({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        brand: item.brand || '',
        stock_quantity: item.stock_quantity.toString(),
        image_url: item.image_url || ''
      });
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await axios.delete(`/api/${type}/${id}`);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1, -1)} deleted successfully!`);
        if (type === 'services') {
          fetchServices();
        } else {
          fetchProducts();
        }
      } catch (error) {
        toast.error(`Error deleting ${type.slice(0, -1)}`);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditItem(null);
    setServiceForm({ name: '', description: '', duration: '', price: '', category: '', benefits: '', image_url: '' });
    setProductForm({ name: '', description: '', price: '', category: '', brand: '', stock_quantity: '', image_url: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // AI Assistant functions
  const handleAiPromptSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/ai-chat/admin/prompt-template', aiPrompt);
      toast.success('AI assistant settings updated successfully!');
    } catch (error) {
      console.error('Error updating AI prompt:', error);
      toast.error('Failed to update AI assistant settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/ai-chat/admin/chat-history?page=${page}&limit=10`);
      setChatHistory(response.data.chats || []);
      setChatPagination({
        page: response.data.page || 1,
        pages: response.data.pages || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to fetch chat history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiPrompt = async () => {
    try {
      const response = await axios.get('/api/ai-chat/prompt-template');
      setAiPrompt(response.data);
    } catch (error) {
      console.error('Error fetching AI prompt:', error);
    }
  };

  // Invoice functions
  const fetchInvoices = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (status) params.append('status', status);
      
      const response = await axios.get(`/api/invoices?${params}`);
      setInvoices(response.data.invoices);
      setInvoicePagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const response = await axios.get('/api/invoices/stats/summary');
      setInvoiceStats(response.data);
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      const response = await axios.get(`/api/invoices/${invoiceId}`);
      setSelectedInvoice(response.data);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast.error('Failed to load invoice details');
    }
  };

  const createInvoice = async () => {
    try {
      const response = await axios.post('/api/invoices', createInvoiceForm);
      toast.success(`Invoice ${response.data.invoiceNumber} created successfully!`);
      setShowCreateInvoiceModal(false);
      fetchInvoices(1, invoiceStatusFilter);
      fetchInvoiceStats();
      setCreateInvoiceForm({
        user_id: '',
        customer_email: '',
        customer_name: '',
        items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }],
        notes: ''
      });
      setUseExistingCustomer(true);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const verifyBookingExists = async (bookingId) => {
    try {
      const response = await axios.get(`/api/invoices/debug/booking/${bookingId}`);
      console.log('Booking verification result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying booking:', error);
      return { found: false, error: error.message };
    }
  };

  const createInvoiceFromBooking = async (bookingId, additionalItems = []) => {
    try {
      console.log('Creating invoice for booking ID:', bookingId);
      
      // First verify the booking exists
      const verification = await verifyBookingExists(bookingId);
      if (!verification.found) {
        toast.error('Booking not found in database. Please refresh and try again.');
        console.error('Booking verification failed:', verification);
        return;
      }
      
      if (!verification.booking?.service_name) {
        toast.error('Booking is missing service information. Cannot create invoice.');
        return;
      }
      
      if (!verification.booking?.user_id) {
        toast.error('Booking is missing customer information. Cannot create invoice.');
        return;
      }
      
      const response = await axios.post(`/api/invoices/from-booking/${bookingId}`, {
        additional_items: additionalItems
      });
      toast.success(`Invoice ${response.data.invoiceNumber} created from booking successfully!`);
      fetchInvoices(1, invoiceStatusFilter);
      fetchInvoiceStats();
    } catch (error) {
      console.error('Error creating invoice from booking:', error);
      console.error('Error details:', error.response?.data);
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        toast.error('Booking not found. It may have been deleted.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.error || 'Invalid booking data for invoice creation');
      } else {
        toast.error(error.response?.data?.error || 'Failed to create invoice from booking');
      }
    }
  };

  const updateInvoiceStatus = async (invoiceId, status, paymentMethod = '', paymentId = '') => {
    try {
      await axios.put(`/api/invoices/${invoiceId}/status`, {
        status,
        payment_method: paymentMethod,
        payment_id: paymentId
      });
      
      // Provide specific success messages
      const statusMessages = {
        'sent': 'Invoice sent successfully!',
        'paid': 'Invoice marked as paid!',
        'cancelled': 'Invoice cancelled successfully!',
        'pending': 'Invoice status updated to pending!',
        'overdue': 'Invoice marked as overdue!'
      };
      
      toast.success(statusMessages[status] || 'Invoice status updated successfully!');
      fetchInvoices(invoicePagination.page, invoiceStatusFilter);
      fetchInvoiceStats();
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status });
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    }
  };

  const editInvoice = async (invoice) => {
    try {
      // Fetch full invoice details with items
      const response = await axios.get(`/api/invoices/${invoice.id}`);
      const invoiceData = response.data;
      
      // Populate edit form with existing data
      setEditInvoiceForm({
        id: invoiceData.id,
        customer_name: invoiceData.customer_name || '',
        customer_email: invoiceData.customer_email || '',
        user_id: invoiceData.user_id || '',
        due_date: invoiceData.due_date ? invoiceData.due_date.split('T')[0] : '',
        notes: invoiceData.notes || '',
        items: invoiceData.items.length > 0 ? invoiceData.items : [
          { item_type: 'service', item_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }
        ]
      });
      
      // Set customer selection method
      setUseExistingCustomerEdit(!!invoiceData.user_id);
      
      // Load customers if not already loaded
      if (customers.length === 0) {
        fetchCustomers();
      }
      
      setShowEditInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching invoice for edit:', error);
      if (error.response?.status === 404) {
        toast.error('Invoice not found');
      } else if (error.response?.status === 400) {
        toast.error('This invoice cannot be edited');
      } else {
        toast.error('Failed to load invoice for editing');
      }
    }
  };

  const updateInvoice = async () => {
    try {
      setLoading(true);
      
      // Prepare the data
      const updateData = {
        items: editInvoiceForm.items
      };
      
      if (useExistingCustomerEdit && editInvoiceForm.user_id) {
        updateData.user_id = parseInt(editInvoiceForm.user_id);
      } else {
        updateData.customer_name = editInvoiceForm.customer_name;
        updateData.customer_email = editInvoiceForm.customer_email;
      }
      
      if (editInvoiceForm.due_date) {
        updateData.due_date = editInvoiceForm.due_date;
      }
      
      if (editInvoiceForm.notes) {
        updateData.notes = editInvoiceForm.notes;
      }

      const response = await axios.put(`/api/invoices/${editInvoiceForm.id}`, updateData);

      toast.success(`Invoice ${response.data.invoiceNumber} updated successfully!`);
      setShowEditInvoiceModal(false);
      
      // Reset form
      setEditInvoiceForm({
        id: '',
        customer_name: '',
        customer_email: '',
        user_id: '',
        due_date: '',
        notes: '',
        items: [{ item_type: 'service', item_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }]
      });
      setUseExistingCustomerEdit(true);
      
      fetchInvoices(1, invoiceStatusFilter);
      fetchInvoiceStats();

      // Update selected invoice if it's being viewed
      if (selectedInvoice && selectedInvoice.id === editInvoiceForm.id) {
        const updatedInvoice = await axios.get(`/api/invoices/${editInvoiceForm.id}`);
        setSelectedInvoice(updatedInvoice.data);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      if (error.response?.status === 400) {
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => toast.error(err.msg));
        } else {
          toast.error(error.response.data.error || 'Invalid invoice data');
        }
      } else if (error.response?.status === 404) {
        toast.error('Invoice not found');
      } else {
        toast.error('Failed to update invoice');
      }
    } finally {
      setLoading(false);
    }
  };

  const addInvoiceItem = () => {
    setCreateInvoiceForm({
      ...createInvoiceForm,
      items: [...createInvoiceForm.items, { item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }]
    });
  };

  const removeInvoiceItem = (index) => {
    const newItems = createInvoiceForm.items.filter((_, i) => i !== index);
    setCreateInvoiceForm({ ...createInvoiceForm, items: newItems });
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...createInvoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCreateInvoiceForm({ ...createInvoiceForm, items: newItems });
  };

  const calculateInvoiceTotal = () => {
    const subtotal = createInvoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = (subtotal * 9.125) / 100;
    return {
      subtotal: subtotal.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: (subtotal + taxAmount).toFixed(2)
    };
  };

  const addEditInvoiceItem = () => {
    setEditInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { item_type: 'service', item_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeEditInvoiceItem = (index) => {
    const updatedItems = editInvoiceForm.items.filter((_, i) => i !== index);
    setEditInvoiceForm(prev => ({
      ...prev,
      items: updatedItems.length > 0 ? updatedItems : [{ item_type: 'service', item_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const updateEditInvoiceItem = (index, field, value) => {
    const updatedItems = [...editInvoiceForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill item details based on selection
    if (field === 'item_id' && value) {
      const itemType = updatedItems[index].item_type;
      const itemList = itemType === 'service' ? services : products;
      const selectedItem = itemList.find(item => item.id === parseInt(value));
      
      if (selectedItem) {
        updatedItems[index].item_name = selectedItem.name;
        updatedItems[index].unit_price = parseFloat(selectedItem.price || 0);
        if (selectedItem.description) {
          updatedItems[index].description = selectedItem.description;
        }
      }
    }
    
    setEditInvoiceForm(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateEditInvoiceTotal = () => {
    return editInvoiceForm.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  // Fetch data when tab is active
  useEffect(() => {
    if (activeTab === 'ai') {
      fetchAiPrompt();
      fetchChatHistory();
    } else if (activeTab === 'invoices') {
      fetchInvoices(1, invoiceStatusFilter);
      fetchInvoiceStats();
    }
  }, [activeTab]);

  return (
    <Container>
      <Header>
        <h1>Admin Dashboard</h1>
        <p>Manage your skincare business</p>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
          <FiUser />
          Services
        </Tab>
        <Tab active={activeTab === 'products'} onClick={() => setActiveTab('products')}>
          <FiPlus />
          Products
        </Tab>
        <Tab active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>
          <FiCalendar />
          Bookings
        </Tab>
        <Tab active={activeTab === 'booking-calendar'} onClick={() => setActiveTab('booking-calendar')}>
          <FiCalendar />
          Booking Calendar
        </Tab>
        <Tab active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>
          <FiClock />
          Time Blocking
        </Tab>
        <Tab active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
          <FiMessageSquare />
          AI Assistant
        </Tab>
        <Tab active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')}>
          <FiUser />
          Invoices
        </Tab>
      </TabContainer>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <Section>
          <Form onSubmit={handleServiceSubmit}>
            <h3>Add New Service</h3>
            <FormGroup>
              <Label>Service Name</Label>
              <Input
                type="text"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={serviceForm.duration}
                onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Input
                type="text"
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Treatment Benefits (one per line)</Label>
              <TextArea
                value={serviceForm.benefits}
                onChange={(e) => setServiceForm({ ...serviceForm, benefits: e.target.value })}
                placeholder="Enter treatment benefits, one per line&#10;Example:&#10;Deep cleansing of pores&#10;Improved skin texture&#10;Relaxation and stress relief"
                rows="6"
                style={{ minHeight: '120px' }}
              />
            </FormGroup>
            <FormGroup>
              <Label>Service Image URL (optional)</Label>
              <Input
                type="url"
                value={serviceForm.image_url}
                onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                placeholder="https://example.com/service-image.jpg"
              />
              {serviceForm.image_url && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img 
                    src={serviceForm.image_url} 
                    alt="Service preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none', color: '#999', fontSize: '0.9em' }}>
                    ❌ Invalid image URL
                  </div>
                </div>
              )}
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Service'}
            </Button>
          </Form>

          <h3>Existing Services</h3>
          <div style={{ marginBottom: '1rem' }}>
            <ActionButton onClick={saveServicesDisplaySettings} variant="primary">
              💾 Save Display Settings
            </ActionButton>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Display</th>
                <th>Order</th>
                <th>Name</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={service.is_displayed ?? true}
                      onChange={(e) => updateServiceDisplay(service.id, 'is_displayed', e.target.checked)}
                      style={{ transform: 'scale(1.2)', margin: '0 auto', display: 'block' }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      value={service.display_order ?? index}
                      onChange={(e) => updateServiceDisplay(service.id, 'display_order', parseInt(e.target.value))}
                      style={{ width: '80px', textAlign: 'center' }}
                    />
                  </td>
                  <td>{service.name}</td>
                  <td>{service.category}</td>
                  <td>{service.duration} min</td>
                  <td>${service.price}</td>
                  <td>
                    <ActionButton onClick={() => handleEdit(service)}>
                      <FiEdit /> Edit
                    </ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDelete(service.id, 'services')}>
                      <FiTrash2 /> Delete
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <Section>
          <Form onSubmit={handleProductSubmit}>
            <h3>Add New Product</h3>
            <FormGroup>
              <Label>Product Name</Label>
              <Input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Input
                type="text"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Brand</Label>
              <Input
                type="text"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Product Image URL (optional)</Label>
              <Input
                type="url"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                placeholder="https://example.com/product-image.jpg"
              />
              {productForm.image_url && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img 
                    src={productForm.image_url} 
                    alt="Product preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none', color: '#999', fontSize: '0.9em' }}>
                    ❌ Invalid image URL
                  </div>
                </div>
              )}
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </Form>

          <h3>Existing Products</h3>
          <div style={{ marginBottom: '1rem' }}>
            <ActionButton onClick={saveProductsDisplaySettings} variant="primary">
              💾 Save Display Settings
            </ActionButton>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Display</th>
                <th>Order</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={product.is_displayed ?? true}
                      onChange={(e) => updateProductDisplay(product.id, 'is_displayed', e.target.checked)}
                      style={{ transform: 'scale(1.2)', margin: '0 auto', display: 'block' }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      value={product.display_order ?? index}
                      onChange={(e) => updateProductDisplay(product.id, 'display_order', parseInt(e.target.value))}
                      style={{ width: '80px', textAlign: 'center' }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stock_quantity}</td>
                  <td>
                    <ActionButton onClick={() => handleEdit(product)}>
                      <FiEdit /> Edit
                    </ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDelete(product.id, 'products')}>
                      <FiTrash2 /> Delete
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <Section>
          <BookingFilters>
            <h3>Booking Management</h3>
            <FilterGroup>
              <Label>Filter by Date</Label>
              <Input
                type="date"
                value={bookingFilters.date}
                onChange={(e) => setBookingFilters({ ...bookingFilters, date: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <Label>Filter by Status</Label>
              <Select
                value={bookingFilters.status}
                onChange={(e) => setBookingFilters({ ...bookingFilters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FilterGroup>
            <Button type="button" onClick={fetchBookings}>
              <FiFilter /> Apply Filters
            </Button>
          </BookingFilters>

          {loading ? (
            <LoadingSpinner>Loading bookings...</LoadingSpinner>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{formatDate(booking.appointment_date)}</td>
                    <td>{formatTime(booking.appointment_time)}</td>
                    <td>
                      <ClientInfo>
                        <strong>{booking.first_name} {booking.last_name}</strong>
                        <small>{booking.email}</small>
                      </ClientInfo>
                    </td>
                    <td>{booking.service_name}</td>
                    <td>{booking.duration} min</td>
                    <td>${booking.total_amount}</td>
                    <td>
                      <StatusBadge status={booking.status}>
                        {booking.status}
                      </StatusBadge>
                    </td>
                    <td>
                      {booking.status === 'confirmed' && (
                        <>
                          <ActionButton 
                            variant="success" 
                            onClick={() => handleCheckout(booking.id)}
                            style={{ 
                              background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                              fontWeight: '600',
                              marginRight: '0.5rem'
                            }}
                          >
                            🛒 Checkout
                          </ActionButton>
                          <ActionButton variant="danger" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                            Cancel
                          </ActionButton>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <ActionButton 
                          variant="primary" 
                          onClick={() => {
                            console.log('Creating additional invoice for booking:', booking);
                            createInvoiceFromBooking(booking.id);
                          }}
                        >
                          📄 New Invoice
                        </ActionButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Section>
      )}

      {/* Calendar Blocking Tab */}
      {activeTab === 'calendar' && (
        <Section>
          <Form onSubmit={handleBlockSlot}>
            <h3>Block Time Slots</h3>
            <p>Block times when you're not available for appointments</p>
            
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                value={blockForm.block_date}
                onChange={(e) => setBlockForm({ ...blockForm, block_date: e.target.value })}
                min={getTomorrowDate()}
                required
              />
            </FormGroup>
            <FormRow>
              <FormGroup>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={blockForm.start_time}
                  onChange={(e) => setBlockForm({ ...blockForm, start_time: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={blockForm.end_time}
                  onChange={(e) => setBlockForm({ ...blockForm, end_time: e.target.value })}
                  required
                />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <Label>Reason (Optional)</Label>
              <Input
                type="text"
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                placeholder="e.g., Personal appointment, Vacation, etc."
              />
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Blocking...' : 'Block Time Slot'}
            </Button>
          </Form>

          <h3>Blocked Time Slots</h3>
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Range</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedSlots.map(slot => (
                <tr key={slot.id}>
                  <td>{formatDate(slot.block_date)}</td>
                  <td>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</td>
                  <td>{slot.reason || 'No reason specified'}</td>
                  <td>
                    <ActionButton variant="danger" onClick={() => handleDeleteBlockedSlot(slot.id)}>
                      <FiX /> Unblock
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      )}

      {/* Edit Modal */}
      <Modal show={showModal}>
        <ModalContent>
          <h3>Edit {activeTab === 'services' ? 'Service' : 'Product'}</h3>
          <Form onSubmit={activeTab === 'services' ? handleServiceSubmit : handleProductSubmit}>
            {activeTab === 'services' ? (
              <>
                <FormGroup>
                  <Label>Service Name</Label>
                  <Input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Category</Label>
                  <Input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Treatment Benefits (one per line)</Label>
                  <TextArea
                    value={serviceForm.benefits}
                    onChange={(e) => setServiceForm({ ...serviceForm, benefits: e.target.value })}
                    placeholder="Enter treatment benefits, one per line&#10;Example:&#10;Deep cleansing of pores&#10;Improved skin texture&#10;Relaxation and stress relief"
                    rows="6"
                    style={{ minHeight: '120px' }}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Service Image URL (optional)</Label>
                  <Input
                    type="url"
                    value={serviceForm.image_url}
                    onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                    placeholder="https://example.com/service-image.jpg"
                  />
                  {serviceForm.image_url && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img 
                        src={serviceForm.image_url} 
                        alt="Service preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none', color: '#999', fontSize: '0.9em' }}>
                        ❌ Invalid image URL
                      </div>
                    </div>
                  )}
                </FormGroup>
              </>
            ) : (
              <>
                <FormGroup>
                  <Label>Product Name</Label>
                  <Input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Category</Label>
                  <Input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Brand</Label>
                  <Input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Product Image URL (optional)</Label>
                  <Input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://example.com/product-image.jpg"
                  />
                  {productForm.image_url && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img 
                        src={productForm.image_url} 
                        alt="Product preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none', color: '#999', fontSize: '0.9em' }}>
                        ❌ Invalid image URL
                      </div>
                    </div>
                  )}
                </FormGroup>
              </>
            )}
            <ButtonGroup>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
              <Button variant="secondary" type="button" onClick={closeModal}>
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      {/* AI Assistant Tab */}
      {activeTab === 'ai' && (
        <div>
          <Section>
            <Form onSubmit={handleAiPromptSubmit}>
              <h3>AI Assistant Configuration</h3>
              <FormGroup>
                <Label>Assistant Name</Label>
                <Input
                  type="text"
                  value={aiPrompt.name}
                  onChange={(e) => setAiPrompt({ ...aiPrompt, name: e.target.value })}
                  placeholder="e.g., Skincare Assistant"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Welcome Message</Label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    fontFamily: 'inherit'
                  }}
                  value={aiPrompt.welcome_message}
                  onChange={(e) => setAiPrompt({ ...aiPrompt, welcome_message: e.target.value })}
                  placeholder="Enter the initial greeting message..."
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>System Prompt (AI Instructions)</Label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '200px',
                    fontFamily: 'inherit'
                  }}
                  value={aiPrompt.system_prompt}
                  onChange={(e) => setAiPrompt({ ...aiPrompt, system_prompt: e.target.value })}
                  placeholder="Enter detailed instructions for the AI assistant..."
                  required
                />
                <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                  Include information about services, pricing, location, hours, and how the assistant should behave.
                </small>
              </FormGroup>
              
              <Button type="submit">Update AI Assistant</Button>
            </Form>
          </Section>
          
          <Section>
            <SectionHeader>
              <h3>Chat History</h3>
              <p>Recent conversations with customers ({chatPagination.total} total)</p>
            </SectionHeader>
            
            {chatHistory.length > 0 ? (
              <>
                <Table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Message</th>
                      <th>Response</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatHistory.map((chat) => (
                      <tr key={chat.id}>
                        <td style={{ fontSize: '0.9rem' }}>
                          {new Date(chat.created_at).toLocaleDateString()}<br/>
                          <small style={{ color: '#666' }}>
                            {new Date(chat.created_at).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>{chat.customer_name || 'Anonymous'}</td>
                        <td style={{ maxWidth: '200px', wordBreak: 'break-word' }}>
                          {chat.message}
                        </td>
                        <td style={{ maxWidth: '250px', wordBreak: 'break-word' }}>
                          {chat.response}
                        </td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            backgroundColor: chat.is_existing_customer ? '#e8f5e8' : '#e8f0ff',
                            color: chat.is_existing_customer ? '#2e7d2e' : '#1e40af'
                          }}>
                            {chat.is_existing_customer ? 'Returning' : 'New'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                
                {chatPagination.pages > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    marginTop: '1rem' 
                  }}>
                    {Array.from({ length: chatPagination.pages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => fetchChatHistory(pageNum)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: pageNum === chatPagination.page ? '#3498db' : 'white',
                          color: pageNum === chatPagination.page ? 'white' : '#333',
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#666' 
              }}>
                <FiMessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h4>No chat history yet</h4>
                <p>Customer conversations will appear here once they start using the AI assistant.</p>
              </div>
            )}
          </Section>
      </div>
      )}

      {activeTab === 'invoices' && (
        <div>
          <Section>
            <h2>Invoice Management</h2>
            
            {/* Invoice Stats */}
            <StatsContainer>
              <StatCard>
                <StatNumber>{invoiceStats.total_invoices}</StatNumber>
                <StatLabel>Total Invoices</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{invoiceStats.pending_invoices}</StatNumber>
                <StatLabel>Pending Invoices</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{invoiceStats.paid_invoices}</StatNumber>
                <StatLabel>Paid Invoices</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{invoiceStats.cancelled_invoices}</StatNumber>
                <StatLabel>Cancelled Invoices</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>${invoiceStats.total_revenue}</StatNumber>
                <StatLabel>Total Revenue</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>${invoiceStats.pending_amount}</StatNumber>
                <StatLabel>Pending Amount</StatLabel>
              </StatCard>
            </StatsContainer>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <ButtonGroup>
                <Button onClick={() => {
                  setShowCreateInvoiceModal(true);
                  if (customers.length === 0) {
                    fetchCustomers(); // Load customers when modal opens if not already loaded
                  }
                }}>
                  <FiPlus /> Create Invoice
                </Button>
              </ButtonGroup>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Label style={{ margin: 0, fontSize: '0.9rem' }}>Filter by Status:</Label>
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => {
                    setInvoiceStatusFilter(e.target.value);
                    fetchInvoices(1, e.target.value);
                  }}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">All Invoices</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Invoices Table */}
            <Table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>{invoice.customer_name}</td>
                    <td>{formatDate(invoice.issue_date)}</td>
                    <td>${invoice.total_amount}</td>
                    <td>
                      <StatusBadge status={invoice.status}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionButton onClick={() => fetchInvoiceDetails(invoice.id)}>
                        <FiEye /> View
                      </ActionButton>
                      {invoice.status === 'pending' && (
                        <>
                          <ActionButton onClick={() => editInvoice(invoice)}>
                            ✏️ Edit
                          </ActionButton>
                          <ActionButton 
                            variant="primary" 
                            onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                          >
                            Send
                          </ActionButton>
                          <ActionButton 
                            variant="success" 
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                          >
                            Mark Paid
                          </ActionButton>
                          <ActionButton 
                            variant="danger" 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this invoice?')) {
                                updateInvoiceStatus(invoice.id, 'cancelled');
                              }
                            }}
                          >
                            Cancel
                          </ActionButton>
                        </>
                      )}
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <>
                          <ActionButton 
                            variant="success" 
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                          >
                            Mark Paid
                          </ActionButton>
                          <ActionButton 
                            variant="danger" 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this invoice?')) {
                                updateInvoiceStatus(invoice.id, 'cancelled');
                              }
                            }}
                          >
                            Cancel
                          </ActionButton>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {invoicePagination.pages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                marginTop: '1rem' 
              }}>
                                 {Array.from({ length: invoicePagination.pages }, (_, i) => i + 1).map(pageNum => (
                   <button
                     key={pageNum}
                     onClick={() => fetchInvoices(pageNum, invoiceStatusFilter)}
                     style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: pageNum === invoicePagination.page ? '#3498db' : 'white',
                      color: pageNum === invoicePagination.page ? 'white' : '#333',
                      cursor: 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <Modal onClick={() => setShowCreateInvoiceModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
            <ModalHeader>
              <h3>Create New Invoice</h3>
              <CloseButton onClick={() => {
                setShowCreateInvoiceModal(false);
                setCreateInvoiceForm({
                  user_id: '',
                  customer_email: '',
                  customer_name: '',
                  items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }],
                  notes: ''
                });
                setUseExistingCustomer(true);
              }}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Customer Information</Label>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="radio"
                      checked={useExistingCustomer}
                      onChange={() => setUseExistingCustomer(true)}
                    />
                    Select Existing Customer
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      checked={!useExistingCustomer}
                      onChange={() => setUseExistingCustomer(false)}
                    />
                    Enter Customer Details Manually
                  </label>
                </div>
                
                {useExistingCustomer ? (
                  <select
                    value={createInvoiceForm.user_id}
                    onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, user_id: e.target.value })}
                    required={useExistingCustomer}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select Customer</option>
                    {Array.isArray(customers) && customers.length > 0 ? (
                      customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} ({customer.email})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {loading ? 'Loading customers...' : 'No customers available'}
                      </option>
                    )}
                  </select>
                ) : (
                  <div>
                    <Input
                      type="text"
                      placeholder="Customer Name"
                      value={createInvoiceForm.customer_name}
                      onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, customer_name: e.target.value })}
                      required={!useExistingCustomer}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <Input
                      type="email"
                      placeholder="Customer Email"
                      value={createInvoiceForm.customer_email}
                      onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, customer_email: e.target.value })}
                      required={!useExistingCustomer}
                    />
                  </div>
                )}
              </FormGroup>

              <h4>Invoice Items</h4>
              {createInvoiceForm.items.map((item, index) => (
                <div key={index} style={{ 
                  border: '1px solid #eee', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  borderRadius: '4px'
                }}>
                  <FormRow>
                    <FormGroup>
                      <Label>Item Type</Label>
                      <select
                        value={item.item_type}
                        onChange={(e) => updateInvoiceItem(index, 'item_type', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="service">Service</option>
                        <option value="product">Product</option>
                      </select>
                    </FormGroup>
                    <FormGroup>
                      <Label>Item Name</Label>
                      <Input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateInvoiceItem(index, 'item_name', e.target.value)}
                        required
                      />
                    </FormGroup>
                  </FormRow>
                  <FormGroup>
                    <Label>Description</Label>
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value))}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Unit Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value))}
                        required
                      />
                    </FormGroup>
                  </FormRow>
                  {createInvoiceForm.items.length > 1 && (
                    <ActionButton 
                      variant="danger" 
                      onClick={() => removeInvoiceItem(index)}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <FiX /> Remove Item
                    </ActionButton>
                  )}
                </div>
              ))}

              <Button 
                type="button" 
                onClick={addInvoiceItem}
                style={{ marginBottom: '1rem' }}
              >
                <FiPlus /> Add Item
              </Button>

              <FormGroup>
                <Label>Notes</Label>
                <textarea
                  value={createInvoiceForm.notes}
                  onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, notes: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </FormGroup>

              {/* Invoice Total */}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '4px',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <span>${calculateInvoiceTotal().subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Tax (9.125%):</span>
                  <span>${calculateInvoiceTotal().tax}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold',
                  borderTop: '1px solid #ddd',
                  paddingTop: '0.5rem'
                }}>
                  <span>Total:</span>
                  <span>${calculateInvoiceTotal().total}</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => {
                setShowCreateInvoiceModal(false);
                setCreateInvoiceForm({
                  user_id: '',
                  customer_email: '',
                  customer_name: '',
                  items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }],
                  notes: ''
                });
                setUseExistingCustomer(true);
              }}>
                Cancel
              </Button>
              <Button onClick={createInvoice}>
                Create Invoice
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Invoice Modal */}
      {showEditInvoiceModal && (
        <Modal onClick={() => setShowEditInvoiceModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
            <ModalHeader>
              <h3>Edit Invoice</h3>
              <CloseButton onClick={() => {
                setShowEditInvoiceModal(false);
                setEditInvoiceForm({
                  id: '',
                  user_id: '',
                  customer_email: '',
                  customer_name: '',
                  items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }],
                  notes: ''
                });
                setUseExistingCustomerEdit(true);
              }}>
                &times;
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Customer Information</Label>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                      type="radio"
                      checked={useExistingCustomerEdit}
                      onChange={() => setUseExistingCustomerEdit(true)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Select Existing Customer
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      checked={!useExistingCustomerEdit}
                      onChange={() => setUseExistingCustomerEdit(false)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Enter Customer Manually
                  </label>
                </div>

                {useExistingCustomerEdit ? (
                  <FormGroup>
                    <Label>Customer</Label>
                    <select
                      value={editInvoiceForm.user_id}
                      onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, user_id: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">Select a customer...</option>
                      {Array.isArray(customers) && customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                ) : (
                  <>
                    <FormGroup>
                      <Label>Customer Name</Label>
                      <Input
                        type="text"
                        value={editInvoiceForm.customer_name}
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_name: e.target.value })}
                        placeholder="Customer name"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Customer Email</Label>
                      <Input
                        type="email"
                        value={editInvoiceForm.customer_email}
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_email: e.target.value })}
                        placeholder="customer@email.com"
                      />
                    </FormGroup>
                  </>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editInvoiceForm.due_date}
                  onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, due_date: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <Label>Invoice Items</Label>
                  <Button variant="primary" onClick={addEditInvoiceItem}>
                    Add Item
                  </Button>
                </div>
                {editInvoiceForm.items.map((item, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                      <FormGroup>
                        <Label>Type</Label>
                        <select
                          value={item.item_type}
                          onChange={(e) => updateEditInvoiceItem(index, 'item_type', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="service">Service</option>
                          <option value="product">Product</option>
                        </select>
                      </FormGroup>
                      <FormGroup>
                        <Label>Item</Label>
                        <select
                          value={item.item_id}
                          onChange={(e) => updateEditInvoiceItem(index, 'item_id', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">Select {item.item_type}...</option>
                          {(item.item_type === 'service' ? services : products).map(serviceOrProduct => (
                            <option key={serviceOrProduct.id} value={serviceOrProduct.id}>
                              {serviceOrProduct.name} - ${serviceOrProduct.price}
                            </option>
                          ))}
                        </select>
                      </FormGroup>
                      <FormGroup>
                        <Label>Custom Name (optional)</Label>
                        <Input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => updateEditInvoiceItem(index, 'item_name', e.target.value)}
                          placeholder="Item name"
                        />
                      </FormGroup>
                      {editInvoiceForm.items.length > 1 && (
                        <Button
                          variant="danger"
                          onClick={() => removeEditInvoiceItem(index)}
                          style={{ marginBottom: '1.5rem' }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <FormGroup>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateEditInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Unit Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateEditInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Total</Label>
                        <Input
                          type="text"
                          value={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                          readOnly
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                      </FormGroup>
                    </div>
                    <FormGroup>
                      <Label>Description (optional)</Label>
                      <Input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateEditInvoiceItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </FormGroup>
                  </div>
                ))}
                
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Subtotal:</span>
                    <span>${calculateEditInvoiceTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Tax (9.125%):</span>
                    <span>${(calculateEditInvoiceTotal() * 0.09125).toFixed(2)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    borderTop: '1px solid #ddd',
                    paddingTop: '0.5rem'
                  }}>
                    <span>Total:</span>
                    <span>${(calculateEditInvoiceTotal() * 1.09125).toFixed(2)}</span>
                  </div>
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Notes (optional)</Label>
                <textarea
                  rows="3"
                  value={editInvoiceForm.notes}
                  onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Add any notes for this invoice..."
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => {
                setShowEditInvoiceModal(false);
                setEditInvoiceForm({
                  id: '',
                  user_id: '',
                  customer_email: '',
                  customer_name: '',
                  items: [{ item_type: 'service', item_name: '', quantity: 1, unit_price: 0, description: '' }],
                  notes: ''
                });
                setUseExistingCustomerEdit(true);
              }}>
                Cancel
              </Button>
              <Button onClick={updateInvoice}>
                Update Invoice
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <Modal onClick={() => setShowInvoiceModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
            <ModalHeader>
              <h3>Invoice {selectedInvoice.invoice_number}</h3>
              <CloseButton onClick={() => setShowInvoiceModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '2rem' }}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedInvoice.customer_name}</p>
                <p><strong>Email:</strong> {selectedInvoice.customer_email}</p>
                {selectedInvoice.customer_phone && (
                  <p><strong>Phone:</strong> {selectedInvoice.customer_phone}</p>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4>Invoice Details</h4>
                <p><strong>Issue Date:</strong> {formatDate(selectedInvoice.issue_date)}</p>
                <p><strong>Due Date:</strong> {formatDate(selectedInvoice.due_date)}</p>
                <p><strong>Status:</strong> 
                  <StatusBadge status={selectedInvoice.status} style={{ marginLeft: '0.5rem' }}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </StatusBadge>
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4>Items</h4>
                <Table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <strong>{item.item_name}</strong>
                            {item.description && <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.description}</div>}
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>${item.unit_price}</td>
                        <td>${item.total_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '4px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Tax ({selectedInvoice.tax_rate}%):</span>
                  <span>${selectedInvoice.tax_amount}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  borderTop: '1px solid #ddd',
                  paddingTop: '0.5rem'
                }}>
                  <span>Total:</span>
                  <span>${selectedInvoice.total_amount}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Notes</h4>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {selectedInvoice.status === 'pending' && (
                <>
                  <Button onClick={() => {
                    setShowInvoiceModal(false);
                    editInvoice(selectedInvoice);
                  }}>
                    ✏️ Edit Invoice
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, 'sent')}
                  >
                    Send Invoice
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                  >
                    Mark as Paid
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this invoice?')) {
                        updateInvoiceStatus(selectedInvoice.id, 'cancelled');
                      }
                    }}
                  >
                    Cancel Invoice
                  </Button>
                </>
              )}
              {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                <>
                  <Button 
                    variant="success" 
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                  >
                    Mark as Paid
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this invoice?')) {
                        updateInvoiceStatus(selectedInvoice.id, 'cancelled');
                      }
                    }}
                  >
                    Cancel Invoice
                  </Button>
                </>
              )}
              {selectedInvoice.status === 'paid' && (
                <Button 
                  variant="warning" 
                  onClick={() => updateInvoiceStatus(selectedInvoice.id, 'pending')}
                >
                  Mark as Pending
                </Button>
              )}
              {selectedInvoice.status === 'cancelled' && (
                <Button 
                  variant="warning" 
                  onClick={() => updateInvoiceStatus(selectedInvoice.id, 'pending')}
                >
                  Reactivate Invoice
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Booking Calendar Tab */}
      {activeTab === 'booking-calendar' && (
        <Section>
          <CalendarContainer>
            <CalendarHeader>
              <h3>Booking Calendar</h3>
              <CalendarControls>
                <CalendarViewToggle>
                  <ViewButton 
                    active={calendarView === 'month'} 
                    onClick={() => setCalendarView('month')}
                  >
                    Month
                  </ViewButton>
                  <ViewButton 
                    active={calendarView === 'week'} 
                    onClick={() => setCalendarView('week')}
                  >
                    Week
                  </ViewButton>
                  <ViewButton 
                    active={calendarView === 'day'} 
                    onClick={() => setCalendarView('day')}
                  >
                    Day
                  </ViewButton>
                </CalendarViewToggle>
                <CalendarNavigation>
                  <NavButton onClick={() => navigateCalendar(-1)}>
                    <FiChevronLeft />
                  </NavButton>
                  <CalendarTitle>
                    {formatCalendarTitle(currentDate, calendarView)}
                  </CalendarTitle>
                  <NavButton onClick={() => navigateCalendar(1)}>
                    <FiChevronRight />
                  </NavButton>
                </CalendarNavigation>
                <Button 
                  variant="secondary" 
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </CalendarControls>
            </CalendarHeader>

            {calendarView === 'month' ? (
              <MonthCalendar 
                currentDate={currentDate}
                bookings={bookings}
                onBookingClick={(booking) => {
                  setSelectedBooking(booking);
                  setShowBookingDetails(true);
                }}
              />
            ) : calendarView === 'week' ? (
              <WeekCalendar 
                currentDate={currentDate}
                bookings={bookings}
                onBookingClick={(booking) => {
                  setSelectedBooking(booking);
                  setShowBookingDetails(true);
                }}
              />
            ) : (
              <DayCalendar 
                currentDate={currentDate}
                bookings={bookings}
                onBookingClick={(booking) => {
                  setSelectedBooking(booking);
                  setShowBookingDetails(true);
                }}
              />
            )}

            <CalendarLegend>
              <LegendItem>
                <LegendColor color="#f8b2c4" />
                <span>Pending</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#f48fb1" />
                <span>Confirmed</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#e91e63" />
                <span>Completed</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#f5c6cb" />
                <span>Cancelled</span>
              </LegendItem>
            </CalendarLegend>
          </CalendarContainer>
        </Section>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>Booking Details</h3>
              <CloseButton onClick={() => setShowBookingDetails(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <BookingDetailGrid>
                <BookingDetailItem>
                  <strong>Customer:</strong>
                  <span>{selectedBooking.customer_name || `${selectedBooking.first_name} ${selectedBooking.last_name}`}</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Email:</strong>
                  <span>{selectedBooking.email}</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Service:</strong>
                  <span>{selectedBooking.service_name}</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Date:</strong>
                  <span>{new Date(selectedBooking.appointment_date).toLocaleDateString()}</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Time:</strong>
                  <span>{selectedBooking.appointment_time}</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Duration:</strong>
                  <span>{selectedBooking.duration} minutes</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Price:</strong>
                  <span>${selectedBooking.total_amount}</span>
                </BookingDetailItem>
                <BookingDetailItem>
                  <strong>Status:</strong>
                  <StatusBadge status={selectedBooking.status}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </StatusBadge>
                </BookingDetailItem>
                {selectedBooking.notes && (
                  <BookingDetailItem style={{ gridColumn: '1 / -1' }}>
                    <strong>Notes:</strong>
                    <span>{selectedBooking.notes}</span>
                  </BookingDetailItem>
                )}
              </BookingDetailGrid>
            </ModalBody>
            <ModalFooter>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {selectedBooking.status === 'confirmed' && (
                  <>
                    <ActionButton 
                      variant="success" 
                      onClick={() => {
                        handleCheckout(selectedBooking.id);
                        setShowBookingDetails(false);
                      }}
                      style={{ 
                        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                        fontWeight: '600',
                      }}
                    >
                      🛒 Checkout
                    </ActionButton>
                    <ActionButton 
                      variant="danger" 
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'cancelled');
                        setShowBookingDetails(false);
                      }}
                    >
                      Cancel Booking
                    </ActionButton>
                  </>
                )}
                {selectedBooking.status === 'completed' && (
                  <ActionButton 
                    variant="primary" 
                    onClick={() => {
                      console.log('Creating additional invoice for booking:', selectedBooking);
                      createInvoiceFromBooking(selectedBooking.id);
                      setShowBookingDetails(false);
                    }}
                  >
                    📄 New Invoice
                  </ActionButton>
                )}
              </div>
              <Button variant="secondary" onClick={() => setShowBookingDetails(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

    </Container>
  );
};

export default AdminDashboard; 