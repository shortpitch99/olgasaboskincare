const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database:', DB_PATH);
    });

    db.serialize(async () => {
      try {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'customer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Services table
        db.run(`CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          duration INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          category TEXT,
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          is_displayed BOOLEAN DEFAULT 1,
          display_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category TEXT,
          brand TEXT,
          stock_quantity INTEGER DEFAULT 0,
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          is_displayed BOOLEAN DEFAULT 1,
          display_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Bookings table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          status TEXT DEFAULT 'confirmed',
          notes TEXT,
          total_amount DECIMAL(10,2),
          payment_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (service_id) REFERENCES services (id)
        )`);

        // Orders table (for product purchases)
        db.run(`CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_id TEXT,
          shipping_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Order items table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Business settings table
        db.run(`CREATE TABLE IF NOT EXISTS business_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Available time slots table
        db.run(`CREATE TABLE IF NOT EXISTS available_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day_of_week INTEGER NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          is_active BOOLEAN DEFAULT 1
        )`);

        // Insert default admin user
        const adminPassword = await bcrypt.hash('admin123', 12);
        db.run(`INSERT OR IGNORE INTO users (email, password, first_name, last_name, role) 
                VALUES (?, ?, ?, ?, ?)`, 
          ['admin@olgasaboskincare.com', adminPassword, 'Admin', 'User', 'admin']);

        // Insert sample services
        const services = [
          {
            name: 'Classic European Facial',
            description: 'A relaxing and rejuvenating facial treatment that cleanses, exfoliates, and nourishes your skin.',
            duration: 60,
            price: 85.00,
            category: 'Facial',
            image_url: '/images/services/european-facial.jpg'
          },
          {
            name: 'Anti-Aging Treatment',
            description: 'Advanced facial treatment targeting fine lines, wrinkles, and age spots using premium products.',
            duration: 90,
            price: 120.00,
            category: 'Anti-Aging',
            image_url: '/images/services/anti-aging.jpg'
          },
          {
            name: 'Deep Cleansing Facial',
            description: 'Intensive treatment for acne-prone or congested skin with extractions and purifying masks.',
            duration: 75,
            price: 95.00,
            category: 'Facial',
            image_url: '/images/services/deep-cleansing.jpg'
          },
          {
            name: 'Hydrating Facial',
            description: 'Perfect for dry or dehydrated skin, this treatment provides intense moisture and nourishment.',
            duration: 60,
            price: 80.00,
            category: 'Facial',
            image_url: '/images/services/hydrating-facial.jpg'
          },
          {
            name: 'Chemical Peel',
            description: 'Professional chemical peel to improve skin texture, reduce acne scars, and brighten complexion.',
            duration: 45,
            price: 110.00,
            category: 'Treatment',
            image_url: '/images/services/chemical-peel.jpg'
          }
        ];

        for (const service of services) {
          db.run(`INSERT OR IGNORE INTO services (name, description, duration, price, category, image_url) 
                  VALUES (?, ?, ?, ?, ?, ?)`, 
            [service.name, service.description, service.duration, service.price, service.category, service.image_url]);
        }

        // Insert sample products
        const products = [
          {
            name: 'Vitamin C Serum',
            description: 'Brightening serum with 20% Vitamin C to reduce dark spots and improve skin radiance.',
            price: 45.00,
            category: 'Serum',
            brand: 'Olga\'s Professional',
            stock_quantity: 25,
            image_url: '/images/products/vitamin-c-serum.jpg'
          },
          {
            name: 'Hyaluronic Acid Moisturizer',
            description: 'Intense hydration cream with hyaluronic acid for plump, moisturized skin.',
            price: 35.00,
            category: 'Moisturizer',
            brand: 'Olga\'s Professional',
            stock_quantity: 30,
            image_url: '/images/products/ha-moisturizer.jpg'
          },
          {
            name: 'Gentle Cleansing Foam',
            description: 'Daily cleanser that removes impurities without stripping natural oils.',
            price: 25.00,
            category: 'Cleanser',
            brand: 'Olga\'s Professional',
            stock_quantity: 40,
            image_url: '/images/products/cleansing-foam.jpg'
          },
          {
            name: 'Retinol Night Cream',
            description: 'Anti-aging night cream with retinol to reduce fine lines and improve skin texture.',
            price: 55.00,
            category: 'Night Cream',
            brand: 'Olga\'s Professional',
            stock_quantity: 20,
            image_url: '/images/products/retinol-cream.jpg'
          }
        ];

        for (const product of products) {
          db.run(`INSERT OR IGNORE INTO products (name, description, price, category, brand, stock_quantity, image_url) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [product.name, product.description, product.price, product.category, product.brand, product.stock_quantity, product.image_url]);
        }

        // Insert default business hours
        const businessHours = [
          { day: 1, start: '09:00', end: '18:00' }, // Monday
          { day: 2, start: '09:00', end: '18:00' }, // Tuesday
          { day: 3, start: '09:00', end: '18:00' }, // Wednesday
          { day: 4, start: '09:00', end: '18:00' }, // Thursday
          { day: 5, start: '09:00', end: '18:00' }, // Friday
          { day: 6, start: '10:00', end: '16:00' }, // Saturday
        ];

        for (const hours of businessHours) {
          db.run(`INSERT OR IGNORE INTO available_slots (day_of_week, start_time, end_time) 
                  VALUES (?, ?, ?)`, 
            [hours.day, hours.start, hours.end]);
        }

        // Insert business settings
        const settings = [
          { key: 'business_name', value: process.env.BUSINESS_NAME || 'Olga\'s Skincare' },
          { key: 'business_email', value: process.env.BUSINESS_EMAIL || 'contact@olgasaboskincare.com' },
          { key: 'business_phone', value: process.env.BUSINESS_PHONE || '+1-555-123-4567' },
          { key: 'business_address', value: process.env.BUSINESS_ADDRESS || '123 Beauty Lane, City, State 12345' },
          { key: 'booking_advance_days', value: '30' },
          { key: 'booking_cancellation_hours', value: '24' }
        ];

        for (const setting of settings) {
          db.run(`INSERT OR IGNORE INTO business_settings (key, value) VALUES (?, ?)`, 
            [setting.key, setting.value]);
        }

        

        // Invoice Tables
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          user_id INTEGER,
          booking_id INTEGER,
          customer_name TEXT,
          customer_email TEXT,
          issue_date DATE NOT NULL,
          due_date DATE NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
          tax_rate DECIMAL(5,4) NOT NULL DEFAULT 9.125,
          tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status TEXT DEFAULT 'pending',
          notes TEXT,
          payment_method TEXT,
          payment_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id INTEGER NOT NULL,
          item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
          item_id INTEGER NOT NULL,
          item_name TEXT NOT NULL,
          description TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
        )`);

        // Add customer fields to existing invoices table if they don't exist
        db.all("PRAGMA table_info(invoices)", (err, columns) => {
          if (!err) {
            const hasCustomerName = columns.some(col => col.name === 'customer_name');
            const hasCustomerEmail = columns.some(col => col.name === 'customer_email');
            
            if (!hasCustomerName) {
              db.run("ALTER TABLE invoices ADD COLUMN customer_name TEXT");
            }
            if (!hasCustomerEmail) {
              db.run("ALTER TABLE invoices ADD COLUMN customer_email TEXT");
            }
          }
        });

        // Add display control fields to existing services table if they don't exist
        db.all("PRAGMA table_info(services)", (err, columns) => {
          if (!err) {
            const hasIsDisplayed = columns.some(col => col.name === 'is_displayed');
            const hasDisplayOrder = columns.some(col => col.name === 'display_order');
            
            if (!hasIsDisplayed) {
              db.run("ALTER TABLE services ADD COLUMN is_displayed BOOLEAN DEFAULT 1");
            }
            if (!hasDisplayOrder) {
              db.run("ALTER TABLE services ADD COLUMN display_order INTEGER DEFAULT 0");
            }
          }
        });

        // Add display control fields to existing products table if they don't exist
        db.all("PRAGMA table_info(products)", (err, columns) => {
          if (!err) {
            const hasIsDisplayed = columns.some(col => col.name === 'is_displayed');
            const hasDisplayOrder = columns.some(col => col.name === 'display_order');
            
            if (!hasIsDisplayed) {
              db.run("ALTER TABLE products ADD COLUMN is_displayed BOOLEAN DEFAULT 1");
            }
            if (!hasDisplayOrder) {
              db.run("ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 0");
            }
          }
        });

        // Add guest booking field to existing users table if it doesn't exist
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (!err) {
            const hasGuestBookingField = columns.some(col => col.name === 'created_via_guest_booking');
            
            if (!hasGuestBookingField) {
              db.run("ALTER TABLE users ADD COLUMN created_via_guest_booking BOOLEAN DEFAULT 0");
            }
          }
        });

        // Add reminder tracking fields to existing bookings table if they don't exist
        db.all("PRAGMA table_info(bookings)", (err, columns) => {
          if (!err) {
            const hasReminderFields = columns.some(col => col.name === 'day_before_reminder_sent');
            
            if (!hasReminderFields) {
              db.run("ALTER TABLE bookings ADD COLUMN day_before_reminder_sent BOOLEAN DEFAULT 0");
              db.run("ALTER TABLE bookings ADD COLUMN same_day_reminder_sent BOOLEAN DEFAULT 0");
              db.run("ALTER TABLE bookings ADD COLUMN email_confirmation_sent BOOLEAN DEFAULT 0");
              console.log('✅ Reminder tracking columns added to bookings table');
            }
          }
        });

        // AI Chat Tables
        db.run(`CREATE TABLE IF NOT EXISTS ai_prompts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          system_prompt TEXT NOT NULL,
          welcome_message TEXT,
          is_active BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS chat_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT,
          message TEXT NOT NULL,
          response TEXT NOT NULL,
          is_existing_customer BOOLEAN DEFAULT 0,
          session_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed default AI prompt with dynamic template variables
        db.run(`INSERT OR IGNORE INTO ai_prompts (id, name, system_prompt, welcome_message, is_active)
                VALUES (1, ?, ?, ?, 1)`, [
          'Dynamic Olga Sabo Skincare Assistant',
          `You are a helpful AI assistant for Olga Sabo Skincare Studio. Today is {{current_date}}.

CURRENT SERVICES:
{{services}}

CURRENT PRODUCTS:
{{products}}

BUSINESS INFORMATION:
{{business_info}}

BUSINESS HOURS:
{{business_hours}}

POPULAR SERVICES:
{{popular_services}}

CURRENT PROMOTIONS:
{{promotions}}

{{customer_history}}

PERSONALITY & APPROACH:
- Always be friendly, professional, and helpful
- Ask for the customer's name if they haven't provided it
- Determine if they're a new or returning customer
- Ask about their skin concerns and goals
- Recommend appropriate services based on their specific needs and skin type
- Provide accurate, up-to-date information about treatments and pricing
- Encourage booking appointments and mention any current promotions
- Offer quick action buttons for common requests (Book Now, Learn More, etc.)
- Use emojis sparingly but appropriately to maintain professionalism
- Be knowledgeable about skincare but recommend professional consultation for serious concerns
- If the customer has a history with us, acknowledge their previous treatments

IMPORTANT GUIDELINES:
- Use ONLY the services and prices listed above - do not invent or hallucinate information
- Always refer to current business hours and contact information
- Personalize responses based on customer history when available
- Mention relevant promotions when appropriate
- Guide customers toward booking appointments
- Provide helpful skincare advice while promoting our services

RESPONSE FORMAT:
Always provide helpful, accurate responses with relevant quick action buttons when appropriate. Keep responses conversational but professional.`,
          'Hello! 👋 Welcome to Olga Sabo Skincare Studio! I\'m your personal skincare assistant. What\'s your name?',
          1
        ]);

        console.log('Database tables created and seeded successfully');
        
        // Close database connection after all operations are complete
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            resolve();
          }
        });
        
      } catch (error) {
        console.error('Error initializing database:', error);
        db.close(() => {
          reject(error);
        });
      }
    });
  });
}

module.exports = initDatabase;

// Run initialization if this script is executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
} 