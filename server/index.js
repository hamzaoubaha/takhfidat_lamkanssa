const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    
    // Format for frontend
    const formatted = products.map(p => ({
      id: p.id,
      name: { ar: p.name_ar, fr: p.name_fr },
      description: { ar: p.description_ar, fr: p.description_fr },
      price: p.price,
      rating: p.rating,
      category: p.category,
      image: p.image
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  const { name_ar, name_fr, description_ar, description_fr, price, category, image } = req.body;
  
  if (!name_ar || !name_fr || !price || !category || !image) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO products (name_ar, name_fr, description_ar, description_fr, price, category, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insert.run(
      name_ar, name_fr, 
      description_ar || '', description_fr || '', 
      price, category, image
    );
    
    res.status(201).json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
