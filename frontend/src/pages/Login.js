import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoginForm = styled.form`
  width: 100%;
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
  
  &:invalid {
    border-color: #e74c3c;
  }
`;

const Button = styled.button`
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-bottom: 1rem;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 1rem;
  
  a {
    color: #3498db;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const AdminDemo = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }
  
  p {
    margin: 0.25rem 0;
    color: #6c757d;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
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
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ submit: result.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@olgasaboskincare.com',
      password: 'admin123'
    });
  };

  return (
    <Container>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Login</Title>
        
        <AdminDemo>
          <h4>🔑 Admin Demo Account</h4>
          <p><strong>Email:</strong> admin@olgasaboskincare.com</p>
          <p><strong>Password:</strong> admin123</p>
          <Button type="button" onClick={fillAdminCredentials} style={{marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.875rem'}}>
            Fill Admin Credentials
          </Button>
        </AdminDemo>

        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="Enter your email"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>

        {errors.submit && <ErrorMessage style={{marginBottom: '1rem'}}>{errors.submit}</ErrorMessage>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <LinkContainer>
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
        </LinkContainer>
      </LoginForm>
    </Container>
  );
};

export default Login; 