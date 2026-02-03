require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');
const puppeteer = require('puppeteer');
const vision = require('@google-cloud/vision');

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration - Add these to your .env file
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sourcing_db',
  password: process.env.DB_PASSWORD || 'password',
  port: 5432,
});

// Google Cloud Vision Setup
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json'
});

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Mock database for demo (replace with real DB queries)
const mockProducts = [
  {
    id: 1,
    name: "TWS Wireless Earbuds Bluetooth 5.3 ANC",
    supplierName: "Shenzhen TechMaster Electronics Co., Ltd.",
    price: 4.20,
    maxPrice: 6.50,
    moq: 100,
    matchScore: 98,
    rating: 4.9,
    reviews: 127,
    isGold: true,
    location: "Guangdong, China",
    responseTime: "< 2h",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    supplierId: "SUP001",
    alibabaUrl: "https://www.alibaba.com/product-detail/earbuds"
  },
  // Add 5-6 more realistic mock products here...
];

// Search Endpoint - TEXT SEARCH
app.get('/api/search', async (req, res) => {
  const { q, gold, maxPrice } = req.query;
  
  try {
    // In production, query your PostgreSQL database:
    // const query = 'SELECT * FROM products WHERE name ILIKE $1 AND price <= $2';
    // const result = await pool.query(query, [`%${q}%`, maxPrice]);
    
    // For demo, filter mock data:
    let results = mockProducts.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) &&
      p.price <= parseFloat(maxPrice || 1000)
    );
    
    if (gold === 'true') {
      results = results.filter(p => p.isGold);
    }
    
    res.json({ 
      success: true, 
      products: results,
      query: q 
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Image Search Endpoint - VISION AI
app.post('/api/search/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Google Vision API - Label Detection
    const [result] = await visionClient.labelDetection(req.file.path);
    const labels = result.labelAnnotations;
    
    console.log('Detected labels:', labels.map(l => l.description));
    
    // Use labels to search database
    // For demo, return products matching "electronics" if image contains tech labels
    const isTech = labels.some(l => 
      ['Electronics', 'Gadget', 'Device', 'Phone'].includes(l.description)
    );
    
    let results = mockProducts;
    if (isTech) {
      results = mockProducts.filter(p => 
        p.name.toLowerCase().includes('earbuds') || 
        p.name.toLowerCase().includes('charger')
      );
    }
    
    res.json({ 
      success: true, 
      products: results,
      detectedLabels: labels.slice(0, 3).map(l => l.description)
    });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Contact Supplier Endpoint
app.post('/api/contact-supplier', async (req, res) => {
  const { name, email, quantity, message, supplierId, productId } = req.body;
  
  try {
    // 1. Save to database
    await pool.query(
      'INSERT INTO inquiries (supplier_id, product_id, buyer_name, buyer_email, quantity, message, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [supplierId, productId, name, email, quantity, message]
    );
    
    // 2. Send email notification (using SendGrid/SES - add API keys to .env)
    console.log(`Email sent to supplier ${supplierId}: New inquiry from ${email}`);
    
    res.json({ success: true, message: 'Inquiry sent' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send inquiry' });
  }
});

// Alibaba Scraping Endpoint (Protected - requires API key)
app.get('/api/scrape/alibaba', async (req, res) => {
  const { keyword } = req.query;
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Puppeteer scraping logic
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(keyword)}`);
    
    // Wait for results
    await page.waitForSelector('.offer-item', { timeout: 5000 });
    
    const products = await page.evaluate(() => {
      // Extract product data from Alibaba DOM
      const items = document.querySelectorAll('.offer-item');
      return Array.from(items).slice(0, 5).map(item => ({
        title: item.querySelector('.title')?.textContent?.trim(),
        price: item.querySelector('.price')?.textContent?.trim(),
        supplier: item.querySelector('.company')?.textContent?.trim()
      }));
    });
    
    await browser.close();
    res.json({ products });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Database: ${process.env.DB_HOST || 'localhost'}`);
});
