import React from 'react';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.fullScreen ? '100vh' : '200px'};
  flex-direction: column;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: var(--text-muted);
  font-size: 0.9rem;
`;

const LoadingSpinner = ({ 
  size = '40px', 
  text = 'Loading...', 
  fullScreen = false,
  showText = true 
}) => {
  return (
    <SpinnerContainer fullScreen={fullScreen}>
      <Spinner size={size} />
      {showText && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 