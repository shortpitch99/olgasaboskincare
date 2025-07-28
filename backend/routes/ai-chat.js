const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const path = require('path');

const dbPath = process.env.DB_NAME || path.join(__dirname, '..', 'olga_skincare.db');
const db = new sqlite3.Database(dbPath);

// Database query functions for template variables
const getTemplateData = {
  // Get current services with pricing
  services: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT name, description, duration, price, category FROM services WHERE is_active = 1 ORDER BY category, price`, (err, services) => {
        if (err) reject(err);
        else {
          const formatted = services.map(s => 
            `- ${s.name} ($${s.price}, ${s.duration} min) - ${s.description}`
          ).join('\n');
          resolve(formatted || 'No services available');
        }
      });
    });
  },

  // Get current products with pricing
  products: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT name, description, price, category, brand FROM products WHERE is_active = 1 ORDER BY category, price`, (err, products) => {
        if (err) reject(err);
        else {
          const formatted = products.map(p => 
            `- ${p.name} by ${p.brand} ($${p.price}) - ${p.description}`
          ).join('\n');
          resolve(formatted || 'No products available');
        }
      });
    });
  },

  // Get business settings
  business_info: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT key, value FROM business_settings WHERE key IN ('business_name', 'business_email', 'business_phone', 'business_address')`, (err, settings) => {
        if (err) reject(err);
        else {
          const info = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
          }, {});
          const formatted = `
Business: ${info.business_name || 'Olga Sabo Skincare Studio'}
Phone: ${info.business_phone || '(831) 233 0612'}
Email: ${info.business_email || 'contact@olgasaboskincare.com'}
Address: ${info.business_address || '18585 Monterey Rd Suite 140 / Studio 12, Morgan Hill, CA 95037'}`;
          resolve(formatted);
        }
      });
    });
  },

  // Get business hours
  business_hours: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT day_of_week, start_time, end_time FROM available_slots WHERE is_active = 1 ORDER BY day_of_week`, (err, slots) => {
        if (err) reject(err);
        else {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const hours = slots.map(slot => {
            const dayName = days[slot.day_of_week];
            return `${dayName}: ${slot.start_time} - ${slot.end_time}`;
          }).join('\n');
          resolve(hours || 'Monday-Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed');
        }
      });
    });
  },

  // Get popular services (most booked)
  popular_services: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT s.name, s.price, s.duration, COUNT(b.id) as booking_count
        FROM services s 
        LEFT JOIN bookings b ON s.id = b.service_id 
        WHERE s.is_active = 1 
        GROUP BY s.id 
        ORDER BY booking_count DESC, s.price ASC 
        LIMIT 3
      `, (err, services) => {
        if (err) reject(err);
        else {
          const formatted = services.map(s => 
            `- ${s.name} ($${s.price}, ${s.duration} min) - ${s.booking_count || 0} bookings`
          ).join('\n');
          resolve(formatted || 'All our services are popular!');
        }
      });
    });
  },

  // Get customer history (if customerName provided)
  customer_history: (customerName) => {
    return new Promise((resolve, reject) => {
      if (!customerName) {
        resolve('');
        return;
      }
      
      db.all(`
        SELECT s.name as service_name, b.appointment_date, b.status
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE (u.first_name LIKE ? OR u.last_name LIKE ?)
        ORDER BY b.appointment_date DESC
        LIMIT 3
      `, [`%${customerName}%`, `%${customerName}%`], (err, bookings) => {
        if (err) reject(err);
        else {
          if (bookings.length > 0) {
            const formatted = bookings.map(b => 
              `- ${b.service_name} on ${b.appointment_date} (${b.status})`
            ).join('\n');
            resolve(`\nCustomer History:\n${formatted}`);
          } else {
            resolve('');
          }
        }
      });
    });
  },

  // Get current date/time
  current_date: () => {
    return Promise.resolve(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  },

  // Get recent promotions or specials
  promotions: () => {
    return Promise.resolve('Ask about our new client special - 15% off your first facial treatment!');
  }
};

// Template processor function
const processTemplate = async (template, customerName = null) => {
  try {
    let processedTemplate = template;
    
    // Find all template variables in the format {{variable_name}}
    const variables = template.match(/\{\{([^}]+)\}\}/g) || [];
    
    // Process each variable
    for (const variable of variables) {
      const variableName = variable.replace(/[{}]/g, '');
      
      if (getTemplateData[variableName]) {
        try {
          let data;
          if (variableName === 'customer_history') {
            data = await getTemplateData[variableName](customerName);
          } else {
            data = await getTemplateData[variableName]();
          }
          processedTemplate = processedTemplate.replace(variable, data);
        } catch (error) {
          console.error(`Error fetching ${variableName}:`, error);
          processedTemplate = processedTemplate.replace(variable, `[Error loading ${variableName}]`);
        }
      } else {
        // Unknown variable, leave as is or provide helpful message
        processedTemplate = processedTemplate.replace(variable, `[Unknown variable: ${variableName}]`);
      }
    }
    
    return processedTemplate;
  } catch (error) {
    console.error('Error processing template:', error);
    return template; // Return original template if processing fails
  }
};

// Hugging Face Inference API (Free tier)
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY || 'demo'; // Can be empty for some models
const HF_MODEL = process.env.HF_MODEL || 'microsoft/DialoGPT-medium';

const callLLM = async (prompt, apiKey = HF_API_KEY, simulationContext = {}) => {
  try {
    // For demo purposes, if no API key, return a simulated response
    if (!apiKey || apiKey === 'demo') {
      return simulateAIResponse(prompt, simulationContext);
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API Error (${response.status}):`, errorText);
      
      if (response.status === 503) {
        console.log(`Model ${HF_MODEL} is loading, this may take a moment...`);
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('HF API Response:', JSON.stringify(data, null, 2));
    
    // Handle different response formats for GGUF models
    let generatedText = '';
    if (Array.isArray(data) && data[0]) {
      generatedText = data[0].generated_text || data[0].text || '';
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else if (data.text) {
      generatedText = data.text;
    }
    
    return generatedText || "I'm here to help! Could you please tell me more about what you're looking for?";
  } catch (error) {
    console.error('LLM API Error:', error);
    return simulateAIResponse(prompt, simulationContext);
  }
};

const simulateAIResponse = (userMessage, context = {}) => {
  const message = userMessage.toLowerCase();
  const { customerName, conversationStage, isExistingCustomer } = context;
  
  // Handle new/returning customer responses more naturally
  if (conversationStage === 'asked_customer_status') {
    if (message.includes('new') || message.includes('first') || message.includes('never') || message.includes('no')) {
      return {
        message: `Welcome to Olga Sabo Skincare Studio! 🎉 It's wonderful to have you as a new client, ${customerName}! I'd love to learn more about your skincare goals. What brings you to us today? Are you looking for a specific treatment, or would you like to learn about our services?`,
        quickActions: ["Learn About Services", "Skincare Consultation", "I have specific concerns"]
      };
    } else if (message.includes('return') || message.includes('been') || message.includes('yes') || message.includes('back')) {
      return {
        message: `Welcome back, ${customerName}! 😊 It's great to see you again! How did your last treatment go? What would you like to focus on today?`,
        quickActions: ["Book Same Treatment", "Try Something New", "Skincare Questions"]
      };
    }
  }
  
  // Service-related responses
  if (message.includes('facial') || message.includes('treatment')) {
    return {
      message: "We offer amazing facial treatments! 🌟 Our most popular services include Hydrating Facials ($80), Deep Cleansing Facials ($95), and Anti-Aging Treatments ($120). Each treatment is personalized for your skin type. Would you like to know more about any specific treatment?",
      quickActions: ["Book Hydrating Facial", "Learn about Anti-Aging", "View All Services"]
    };
  }
  
  if (message.includes('book') || message.includes('appointment')) {
    return {
      message: "I'd love to help you book an appointment! 📅 You can easily book online through our booking page, or I can guide you through our available services first. What type of treatment are you interested in?",
      quickActions: ["Book Now", "View Services", "Check Availability"]
    };
  }
  
  if (message.includes('price') || message.includes('cost')) {
    return {
      message: "Here are our current service prices: 💰\n• Hydrating Facial: $80 (60 min)\n• Deep Cleansing Facial: $95 (75 min)\n• Chemical Peel: $110 (45 min)\n• Anti-Aging Treatment: $120 (90 min)\n\nWe also offer skincare products! Would you like to see our full price list?",
      quickActions: ["View All Prices", "Book Treatment", "See Products"]
    };
  }
  
  if (message.includes('product') || message.includes('skincare')) {
    return {
      message: "We have an excellent selection of professional skincare products! 🧴 Our products are carefully chosen to complement your treatments and help maintain healthy skin at home. Would you like to see our product categories?",
      quickActions: ["View Products", "Skincare Routine", "Product Recommendations"]
    };
  }
  
  if (message.includes('acne') || message.includes('breakout')) {
    return {
      message: "I understand your concern about acne! 😊 Our Deep Cleansing Facial is perfect for acne-prone skin. It includes extractions and purifying masks to help clear congestion. We also have products specifically designed for acne-prone skin. Would you like to learn more?",
      quickActions: ["Book Deep Cleansing", "Acne Products", "Skincare Tips"]
    };
  }
  
  if (message.includes('anti-aging') || message.includes('wrinkle') || message.includes('aging')) {
    return {
      message: "Our Anti-Aging Treatment is fantastic for addressing fine lines and wrinkles! ✨ It's a 90-minute treatment using premium products specifically targeting signs of aging. We also have anti-aging skincare products to maintain results at home.",
      quickActions: ["Book Anti-Aging", "Anti-Aging Products", "Learn More"]
    };
  }
  
  if (message.includes('sensitive') || message.includes('irritated')) {
    return {
      message: "For sensitive skin, I recommend our Hydrating Facial! 🌸 It's gentle, nourishing, and perfect for calming irritated skin. We use only the finest products suitable for sensitive skin types. Would you like to know more about this treatment?",
      quickActions: ["Book Hydrating Facial", "Sensitive Skin Products", "Skin Analysis"]
    };
  }
  
  if (message.includes('consultation') || message.includes('advice')) {
    return {
      message: "We offer personalized skin consultations! 📋 During a consultation, we analyze your skin and recommend the best treatments and products for your specific needs. This helps create a customized skincare plan just for you!",
      quickActions: ["Book Consultation", "Skin Analysis", "Treatment Plan"]
    };
  }
  
  if (message.includes('location') || message.includes('address') || message.includes('where')) {
    return {
      message: "We're located at Olga Sabo Skincare Studio! 📍\n18585 Monterey Rd Suite 140 / Studio 12\nMorgan Hill, California 95037\n\nYou can find us at Sola Salons. We're easy to find and have convenient parking!",
      quickActions: ["Get Directions", "Call Us", "Book Appointment"]
    };
  }
  
  if (message.includes('hours') || message.includes('open') || message.includes('closed')) {
    return {
      message: "Our business hours are: 🕐\nMonday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed\n\nFeel free to call us at (831) 233 0612 or book online anytime!",
      quickActions: ["Book Now", "Call Us", "View Services"]
    };
  }
  
  // Note: "first time" and "new customer" responses are now handled in conversation context above
  
  // Default responses for general conversation
  const defaultResponses = [
    {
      message: "I'm here to help you with all your skincare needs! 😊 Whether you're looking for treatments, products, or just have questions about skincare, I'm happy to assist. What would you like to know?",
      quickActions: ["View Services", "See Products", "Book Appointment"]
    },
    {
      message: "At Olga Sabo Skincare Studio, we believe in personalized care for every client! 🌟 Our expert treatments and professional products are designed to help you achieve healthy, radiant skin. How can I help you today?",
      quickActions: ["Learn About Treatments", "Skincare Products", "Schedule Consultation"]
    }
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Get available template variables for admin interface
router.get('/template-variables', (req, res) => {
  const variables = {
    services: 'Current active services with pricing and descriptions',
    products: 'Current active products with pricing and descriptions', 
    business_info: 'Business contact information (name, phone, email, address)',
    business_hours: 'Current business hours and availability',
    popular_services: 'Most frequently booked services',
    customer_history: 'Customer\'s previous bookings and service history',
    current_date: 'Current date and day of week',
    promotions: 'Current promotions and special offers'
  };
  
  res.json({
    variables,
    usage: 'Use {{variable_name}} in your template to insert dynamic data',
    example: 'Our current services include:\n{{services}}\n\nBusiness hours:\n{{business_hours}}'
  });
});

// Get AI assistant prompt template (admin customizable)
router.get('/prompt-template', (req, res) => {
  try {
    db.get('SELECT * FROM ai_prompts WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1', (err, prompt) => {
      if (err) {
        console.error('Error fetching prompt template:', err);
        return res.status(500).json({ error: 'Failed to fetch prompt template' });
      }
      
      if (!prompt) {
        // Default prompt if none exists - using dynamic template
        const defaultPrompt = {
          id: 1,
          name: 'Dynamic Olga Sabo Skincare Assistant',
          system_prompt: `You are a helpful AI assistant for Olga Sabo Skincare Studio. Today is {{current_date}}.

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
          welcome_message: 'Hello! 👋 Welcome to Olga Sabo Skincare Studio! I\'m your personal skincare assistant. What\'s your name?',
          is_active: 1
        };
        return res.json(defaultPrompt);
      }
      
      res.json(prompt);
    });
  } catch (error) {
    console.error('Error fetching prompt template:', error);
    res.status(500).json({ error: 'Failed to fetch prompt template' });
  }
});

// Chat endpoint
router.post('/', [
  body('message').notEmpty().trim().escape(),
  body('customerName').optional().trim().escape(),
  body('isExistingCustomer').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, customerName, isExistingCustomer, chatHistory } = req.body;
    
    // Get current prompt template
    db.get('SELECT * FROM ai_prompts WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1', async (err, promptTemplate) => {
      if (err) {
        console.error('Error fetching prompt template:', err);
        // Continue with default behavior
      }
      
      // Build context for the AI with dynamic template processing
      let context = '';
      if (promptTemplate) {
        // Process the template with dynamic data
        const processedPrompt = await processTemplate(promptTemplate.system_prompt, customerName);
        context += processedPrompt + '\n\n';
      }
      
      if (customerName) {
        context += `Customer name: ${customerName}\n`;
      }
      
      if (isExistingCustomer) {
        context += 'This is a returning customer.\n';
      } else {
        context += 'This appears to be a new customer.\n';
      }
      
      // Add recent chat history for context
      if (chatHistory && chatHistory.length > 0) {
        context += '\nRecent conversation:\n';
        chatHistory.forEach(msg => {
          context += `${msg.isUser ? 'Customer' : 'Assistant'}: ${msg.text}\n`;
        });
      }
      
      context += `\nCustomer's current message: ${message}\n\nProvide a helpful, friendly response:`;
      
              try {
          // Build context for simulation
          const simulationContext = {
            customerName: customerName,
            isExistingCustomer: isExistingCustomer,
            conversationStage: null
          };
          
          // Determine conversation stage from chat history
          if (chatHistory && chatHistory.length > 0) {
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage.text && lastMessage.text.includes('Are you a returning customer')) {
              simulationContext.conversationStage = 'asked_customer_status';
            }
          }
          
          // Call the LLM or use simulation
          const aiResponse = await callLLM(context, HF_API_KEY, simulationContext);
          
          // Save chat message to database
        db.run(`
          INSERT INTO chat_history (customer_name, message, response, is_existing_customer, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `, [customerName || 'Anonymous', message, aiResponse.message || aiResponse, isExistingCustomer ? 1 : 0], (dbError) => {
          if (dbError) {
            console.error('Error saving chat history:', dbError);
            // Don't fail the request if chat history saving fails
          }
        });
        
        // Return response
        if (typeof aiResponse === 'object') {
          res.json(aiResponse);
        } else {
          res.json({ message: aiResponse });
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        res.status(500).json({ 
          error: 'Sorry, I\'m having trouble right now. Please call us at (831) 233 0612 for immediate assistance!' 
        });
      }
    });
    
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I\'m having trouble right now. Please call us at (831) 233 0612 for immediate assistance!' 
    });
  }
});

// Test template processing (for development/admin use)
router.post('/test-template', [
  body('template').notEmpty().trim(),
  body('customerName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { template, customerName } = req.body;
    
    const processedTemplate = await processTemplate(template, customerName);
    
    res.json({
      original: template,
      processed: processedTemplate,
      variables_found: (template.match(/\{\{([^}]+)\}\}/g) || []).map(v => v.replace(/[{}]/g, '')),
      customer_name: customerName || 'Not provided'
    });
  } catch (error) {
    console.error('Error testing template:', error);
    res.status(500).json({ error: 'Failed to process template' });
  }
});

// Admin: Update prompt template
router.put('/admin/prompt-template', [
  body('name').notEmpty().trim().escape(),
  body('system_prompt').notEmpty().trim(),
  body('welcome_message').notEmpty().trim(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, system_prompt, welcome_message } = req.body;
    
    // Deactivate current prompt
    db.run('UPDATE ai_prompts SET is_active = 0', (err) => {
      if (err) {
        console.error('Error deactivating prompts:', err);
        return res.status(500).json({ error: 'Failed to update prompt template' });
      }
      
      // Insert new prompt
      db.run(`
        INSERT INTO ai_prompts (name, system_prompt, welcome_message, is_active, created_at)
        VALUES (?, ?, ?, 1, datetime('now'))
      `, [name, system_prompt, welcome_message], function(err) {
        if (err) {
          console.error('Error inserting prompt:', err);
          return res.status(500).json({ error: 'Failed to update prompt template' });
        }
        
        res.json({ 
          success: true, 
          promptId: this.lastID,
          message: 'AI prompt template updated successfully!' 
        });
      });
    });
  } catch (error) {
    console.error('Error updating prompt template:', error);
    res.status(500).json({ error: 'Failed to update prompt template' });
  }
});

// Admin: Get chat history
router.get('/admin/chat-history', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    db.all(`
      SELECT * FROM chat_history 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, chatHistory) => {
      if (err) {
        console.error('Error fetching chat history:', err);
        return res.status(500).json({ error: 'Failed to fetch chat history' });
      }
      
      db.get('SELECT COUNT(*) as total FROM chat_history', (countErr, countResult) => {
        if (countErr) {
          console.error('Error counting chat history:', countErr);
          return res.status(500).json({ error: 'Failed to fetch chat history' });
        }
        
        const total = countResult.total;
        
        res.json({
          chatHistory,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router; 