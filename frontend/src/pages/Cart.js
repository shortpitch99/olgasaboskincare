import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Cart = () => {
  return (
    <Container>
      <div>
        <h1>Shopping Cart</h1>
        <p>Shopping cart functionality coming soon...</p>
      </div>
    </Container>
  );
};

export default Cart; 