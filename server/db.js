const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'), { verbose: console.log });

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    price REAL NOT NULL,
    rating REAL DEFAULT 5,
    category TEXT NOT NULL,
    image TEXT NOT NULL
  )
`);

// Insert initial data if empty
const count = db.prepare('SELECT count(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name_ar, name_fr, description_ar, description_fr, price, rating, category, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const initialProducts = [
    ['طقم طناجر سيراميك 12 قطعة', 'Batterie de Cuisine Céramique 12 Pièces', 'طقم عالي الجودة مانع للالتصاق بتصميم أنيق', 'Batterie de cuisine antiadhésive de haute qualité au design élégant', 850, 5, 'kitchen', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=400'],
    ['خلاط كهربائي قوي 1000 واط', 'Mixeur Électrique Puissant 1000W', 'مثالي للعصائر والصلصات مع شفرات فولاذية', 'Idéal pour les jus et sauces avec lames en acier', 350, 4.5, 'appliances', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=400'],
    ['مزهرية سيراميك ذهبية فاخرة', 'Vase en Céramique Dorée de Luxe', 'تضفي لمسة فنية وراقية على صالة منزلك', 'Ajoute une touche artistique et élégante à votre salon', 220, 4, 'decor', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=400']
  ];

  const transaction = db.transaction((products) => {
    for (const p of products) insert.run(p);
  });
  transaction(initialProducts);
}

module.exports = db;
