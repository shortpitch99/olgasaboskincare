# Olga's Skincare Website

A modern, full-stack skincare services and products website built with React, Node.js, Express, SQLite, and Square payment integration.

## Features

### Customer Features
- **Service Booking System**: Browse and book skincare services with real-time availability
- **Product Catalog**: Shop premium skincare products with cart functionality
- **Square Payment Integration**: Secure payment processing for both services and products
- **User Authentication**: Registration, login, and profile management
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Notifications**: Toast notifications for user feedback

### Admin Features
- **Dashboard**: Comprehensive analytics and business insights
- **Service Management**: Create, edit, and manage skincare services
- **Product Management**: Inventory management with stock tracking
- **Booking Management**: View and manage customer appointments
- **User Management**: Manage customer accounts and roles
- **Business Settings**: Configure business hours and settings

### Technical Features
- **RESTful API**: Well-structured backend API with comprehensive endpoints
- **Database**: SQLite for development with easy migration path
- **Authentication**: JWT-based authentication with role-based access control
- **Payment Processing**: Square API integration for secure transactions
- **File Upload**: Support for product and service images
- **Email Notifications**: Booking confirmations and updates

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **React Router**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Framer Motion**: Smooth animations and transitions
- **Axios**: HTTP client for API requests
- **React Toastify**: User notifications
- **React Icons**: Beautiful icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **SQLite3**: Lightweight database for development
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware

### Payment Integration
- **Square API**: Payment processing and refunds
- **Webhook Support**: Real-time payment status updates

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Square Developer Account (for payment processing)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd olga-skincare-website
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_NAME=olga_skincare.db

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Square API Configuration
SQUARE_APPLICATION_ID=your-square-application-id
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_WEBHOOK_SIGNATURE_KEY=your-square-webhook-signature-key
SQUARE_ENVIRONMENT=sandbox  # Change to 'production' for live payments

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Business Information
BUSINESS_NAME=Olga's Skincare
BUSINESS_EMAIL=contact@olgasaboskincare.com
BUSINESS_PHONE=+1-555-123-4567
BUSINESS_ADDRESS=123 Beauty Lane, City, State 12345
```

### 4. Square API Setup

1. Create a Square Developer Account at https://developer.squareup.com/
2. Create a new application
3. Get your Application ID and Access Token from the dashboard
4. For webhooks, set up a webhook endpoint pointing to your domain + `/api/payments/webhook`
5. Update the `.env` file with your Square credentials

### 5. Initialize Database
```bash
cd backend
npm run init-db
```

### 6. Start Development Servers

**Option 1: Start both servers simultaneously (recommended)**
```bash
# From the root directory
npm run dev
```

**Option 2: Start servers separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 7. Default Admin Account

A default admin account is created during database initialization:
- **Email**: admin@olgasaboskincare.com
- **Password**: admin123

**Important**: Change this password immediately after first login!

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Services Endpoints
- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/category/:category` - Get services by category
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Bookings Endpoints
- `GET /api/bookings/availability/:date` - Check availability for date
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status

### Products Endpoints
- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products/order` - Create product order
- `GET /api/products/orders/my-orders` - Get user's orders

### Payments Endpoints
- `POST /api/payments/booking/:bookingId` - Process booking payment
- `POST /api/payments/order/:orderId` - Process order payment
- `GET /api/payments/payment/:paymentId` - Get payment details
- `POST /api/payments/refund/:paymentId` - Process refund (admin only)

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `GET /api/admin/settings` - Get business settings
- `PUT /api/admin/settings` - Update business settings

## Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS or similar
   - Configure security groups to allow HTTP (80), HTTPS (443), and SSH (22)

2. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repository-url>
   cd olga-skincare-website
   
   # Install dependencies
   npm run install-all
   
   # Build frontend
   npm run build
   
   # Copy environment variables
   cp backend/.env.example backend/.env
   # Edit the .env file with production values
   
   # Initialize database
   cd backend && npm run init-db
   ```

4. **Configure PM2**
   ```bash
   # Start application with PM2
   pm2 start backend/server.js --name "olga-skincare"
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/olgaskincare
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
   
       location / {
           root /path/to/olga-skincare-website/frontend/build;
           try_files $uri $uri/ /index.html;
       }
   
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/olgaskincare /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL Certificate (recommended)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### Production Environment Variables

Update your production `.env` file:
```bash
NODE_ENV=production
SQUARE_ENVIRONMENT=production
JWT_SECRET=your-very-secure-production-secret
# Add production Square credentials
# Add production email configuration
```

## Development

### Project Structure
```
olga-skincare-website/
├── backend/
│   ├── database/
│   │   └── init.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── products.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management
```bash
# Initialize/reset database
cd backend
npm run init-db

# View database (optional SQLite browser)
sqlite3 olga_skincare.db
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email contact@olgasaboskincare.com or create an issue in the repository.

## Acknowledgments

- Square API for payment processing
- React and Node.js communities
- All the open-source contributors who made this project possible 