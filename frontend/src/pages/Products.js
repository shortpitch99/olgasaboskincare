import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShield, FiShoppingCart, FiFilter, FiPackage } from 'react-icons/fi';
import axios from 'axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 70vh;
`;

const Header = styled.section`
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : '#dee2e6'};
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-dark)'};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  height: 250px;
  background: linear-gradient(135deg, var(--secondary-color), #F5E1C2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 4rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-color);
  }
`;

const ProductContent = styled.div`
  padding: 2rem;
`;

const ProductBrand = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductCategory = styled.span`
  background: var(--secondary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
`;

const ProductTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
  line-height: 1.3;
`;

const ProductDescription = styled.p`
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProductPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.inStock ? '#27ae60' : '#e74c3c'};
  font-weight: 500;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.disabled ? '#bdc3c7' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.disabled ? '#bdc3c7' : 'var(--primary-dark)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`;

const ViewDetailsButton = styled(Link)`
  padding: 1rem;
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  
  &:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: var(--text-light);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-dark);
  }
`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(response.data.map(product => product.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  };

  const handleAddToCart = (product) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', product);
    alert(`${product.name} will be added to cart (feature coming soon!)`);
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading our products...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Premium Skincare Products</Title>
        <Subtitle>
          Discover our carefully curated collection of professional-grade skincare products 
          from trusted brands to enhance your daily routine.
        </Subtitle>
      </Header>

      {categories.length > 1 && (
        <FilterSection>
          <FiFilter size={20} color="var(--text-light)" />
          {categories.map(category => (
            <FilterButton
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </FilterButton>
          ))}
        </FilterSection>
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState>
          <h3>No Products Found</h3>
          <p>
            {selectedCategory === 'All' 
              ? "We're currently updating our product inventory. Please check back soon!"
              : `No products found in the "${selectedCategory}" category. Try selecting a different category.`
            }
          </p>
        </EmptyState>
      ) : (
        <ProductsGrid>
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductImage>
                <FiShield />
              </ProductImage>
              <ProductContent>
                {product.brand && <ProductBrand>{product.brand}</ProductBrand>}
                {product.category && <ProductCategory>{product.category}</ProductCategory>}
                <ProductTitle>{product.name}</ProductTitle>
                <ProductDescription>{product.description}</ProductDescription>
                <ProductDetails>
                  <ProductPrice>${product.price}</ProductPrice>
                  <StockInfo inStock={product.stock_quantity > 0}>
                    <FiPackage />
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} in stock`
                      : 'Out of stock'
                    }
                  </StockInfo>
                </ProductDetails>
                <ActionButtons>
                  <AddToCartButton
                    disabled={product.stock_quantity === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    <FiShoppingCart />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </AddToCartButton>
                  <ViewDetailsButton to={`/products/${product.id}`}>
                    Details
                  </ViewDetailsButton>
                </ActionButtons>
              </ProductContent>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}
    </Container>
  );
};

export default Products; 