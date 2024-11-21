require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function setupDatabase() {
  try {
    // Drop existing tables
    await db.query('DROP TABLE IF EXISTS product_ingredients');
    await db.query('DROP TABLE IF EXISTS ingredients'); 
    await db.query('DROP TABLE IF EXISTS products');
    await db.query('DROP TABLE IF EXISTS articles');
    await db.query('DROP TABLE IF EXISTS users');

    // Create users table
    await db.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await db.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        carbon_footprint DECIMAL(10, 2) NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create ingredients table
    await db.query(`
      CREATE TABLE ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_harmful BOOLEAN DEFAULT FALSE
      )
    `);

    // Create product_ingredients table
    await db.query(`
      CREATE TABLE product_ingredients (
        product_id INT,
        ingredient_id INT,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        PRIMARY KEY (product_id, ingredient_id)
      )
    `);

    // create table search
      await db.query(`
          CREATE TABLE product_search (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          type VARCHAR(255),
          carbon_footprint DECIMAL(10, 2) NOT NULL,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        );
      `);

    // Create articles table
    await db.query(`
      CREATE TABLE articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        link TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin user
    const email = 'eco-track@gmail.com';
    const password = 'ecotrack2024';
    const username = 'Admin';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new admin user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, true]
    );

    const adminUserId = result.insertId;
    console.log(`Admin user created with ID: ${adminUserId}`);

    // Insert product data
    const productData = [
      ['Organic Apple', 'Green Farms', 'Fruit', 0.03],
      ['Plastic Water Bottle', 'Aqua Corp', 'Beverage Container', 0.08],
      ['Cotton T-Shirt', 'EcoWear', 'Clothing', 2.1],
      ['Beef Steak', 'Meadow Meats', 'Meat', 27.0],
      ['Electric Car', 'Tesla', 'Vehicle', 8500.0],
      ['Smartphone', 'Apple', 'Electronics', 55.0],
      ['Laptop', 'Dell', 'Electronics', 300.0],
      ['Washing Machine', 'Whirlpool', 'Appliance', 350.0],
      ['LED Light Bulb', 'Philips', 'Lighting', 0.4],
      ['Paper Book', 'Penguin Random House', 'Books', 0.9],
      ['Aluminum Can', 'Coca-Cola', 'Beverage Container', 0.17],
      ['Glass Bottle', 'Heineken', 'Beverage Container', 0.28],
      ['Plastic Bag', 'Walmart', 'Shopping', 0.02],
      ['Reusable Cloth Bag', 'Whole Foods', 'Shopping', 0.7],
      ['Banana', 'Chiquita', 'Fruit', 0.07],
      ['Gasoline Car', 'Toyota', 'Vehicle', 12000.0],
      ['Solar Panel', 'SunPower', 'Energy', 500.0],
      ['Disposable Diaper', 'Pampers', 'Baby Care', 0.15],
      ['Cloth Diaper', 'BumGenius', 'Baby Care', 1.2],
      ['Plastic Straw', "McDonald's", 'Utensil', 0.002],
      ['Metal Straw', 'Eco-Straws', 'Utensil', 0.05],
      ['Single-Use Coffee Pod', 'Keurig', 'Beverage', 0.06],
      ['Reusable Coffee Filter', 'Hario', 'Beverage', 0.3],
      ['Toothbrush (Plastic)', 'Colgate', 'Personal Care', 0.05],
      ['Toothbrush (Bamboo)', 'The Humble Co.', 'Personal Care', 0.02],
      ['Shampoo Bottle', 'Pantene', 'Personal Care', 0.11],
      ['Shampoo Bar', 'Lush', 'Personal Care', 0.05],
      ['Cigarettes', 'Marlboro', 'Tobacco', 0.014],
      ['E-cigarette', 'Juul', 'Tobacco', 0.02],
      ['Disposable Razor', 'Gillette', 'Personal Care', 0.008],
      ['Safety Razor', 'Merkur', 'Personal Care', 0.05],
      ['Synthetic Fertilizer', 'Miracle-Gro', 'Agriculture', 3.6],
      ['Organic Compost', "Nature's Care", 'Agriculture', 0.5],
      ['Plastic Toys', 'Mattel', 'Toys', 0.7],
      ['Wooden Toys', 'Melissa & Doug', 'Toys', 0.3],
      ['Fast Fashion Dress', 'H&M', 'Clothing', 5.5],
      ['Sustainable Fashion Dress', 'Patagonia', 'Clothing', 3.2],
      ['Disposable Face Mask', '3M', 'Personal Protection', 0.06],
      ['Reusable Cloth Mask', 'Hanes', 'Personal Protection', 0.2],
      ['Plastic Food Container', 'Tupperware', 'Kitchen', 0.25],
      ['Glass Food Container', 'Pyrex', 'Kitchen', 0.7],
      ['Single-Use Plastic Cutlery', 'Dixie', 'Utensil', 0.01],
      ['Reusable Metal Cutlery', 'IKEA', 'Utensil', 0.3],
      ['Bottled Soda', 'PepsiCo', 'Beverage', 0.2],
      ['Soda Stream', 'SodaStream', 'Beverage', 5.0],
      ['Disposable Ballpoint Pen', 'BIC', 'Stationery', 0.01],
      ['Refillable Fountain Pen', 'Parker', 'Stationery', 0.05],
      ['Paper Napkins', 'Kleenex', 'Kitchen', 0.008],
      ['Cloth Napkins', 'Williams-Sonoma', 'Kitchen', 0.2],
      ['Single-Use Batteries', 'Duracell', 'Electronics', 0.12],
      ['Rechargeable Batteries', 'Energizer', 'Electronics', 0.4],
      ['Incandescent Light Bulb', 'GE', 'Lighting', 0.45],
      ['Smart LED Bulb', 'Philips Hue', 'Lighting', 0.6],
      ['Gas Lawn Mower', 'John Deere', 'Gardening', 120.0],
      ['Electric Lawn Mower', 'EGO', 'Gardening', 60.0],
      ['Plastic Toothpaste Tube', 'Crest', 'Personal Care', 0.02],
      ['Metal Toothpaste Tube', "David's", 'Personal Care', 0.04],
      ['Disposable Camera', 'Kodak', 'Electronics', 0.3],
      ['Digital Camera', 'Canon', 'Electronics', 87.0],
      ['Paper Coffee Cup', 'Starbucks', 'Beverage Container', 0.033],
      ['Reusable Coffee Mug', 'Yeti', 'Beverage Container', 1.2],
      ['Plastic Cling Wrap', 'Glad', 'Kitchen', 0.05],
      ['Beeswax Wrap', "Bee's Wrap", 'Kitchen', 0.1],
      ['Styrofoam Cooler', 'Coleman', 'Outdoor', 1.5],
      ['Reusable Cooler', 'RTIC', 'Outdoor', 10.0],
      ['Disposable Chopsticks', 'Panda Express', 'Utensil', 0.005],
      ['Reusable Chopsticks', 'Snow Peak', 'Utensil', 0.1],
      ['Dryer Sheets', 'Bounce', 'Laundry', 0.015],
      ['Wool Dryer Balls', 'Smart Sheep', 'Laundry', 0.3],
      ['Plastic Floss', 'Oral-B', 'Personal Care', 0.001],
      ['Silk Floss', 'Dental Lace', 'Personal Care', 0.0005],
      ['K-Cup Coffee Maker', 'Keurig', 'Appliance', 55.0],
      ['French Press', 'Bodum', 'Appliance', 4.0],
      ['Single-Use Plastic Water Filter', 'Brita', 'Kitchen', 0.2],
      ['Long-Life Water Filter', 'Berkey', 'Kitchen', 2.0],
      ['Disposable Cleaning Wipes', 'Clorox', 'Cleaning', 0.02],
      ['Reusable Cleaning Cloths', 'E-Cloth', 'Cleaning', 0.3],
      ['Plastic Shower Curtain', 'Target', 'Bathroom', 1.8],
      ['Fabric Shower Curtain', 'West Elm', 'Bathroom', 2.5],
      ['Disposable Plastic Razor', 'Schick', 'Personal Care', 0.008],
      ['Electric Razor', 'Braun', 'Personal Care', 5.0],
      ['Aerosol Deodorant', 'Axe', 'Personal Care', 0.15],
      ['Natural Deodorant Stick', 'Native', 'Personal Care', 0.05],
      ['Plastic Laundry Detergent Bottle', 'Tide', 'Laundry', 0.2],
      ['Laundry Detergent Sheets', 'Earth Breeze', 'Laundry', 0.05],
      ['Disposable Aluminum Baking Tray', 'Reynolds', 'Kitchen', 0.3],
      ['Silicone Baking Mat', 'Silpat', 'Kitchen', 0.8],
      ['Plastic Dish Sponge', 'Scotch-Brite', 'Cleaning', 0.02],
      ['Natural Loofah', 'EcoTools', 'Cleaning', 0.01],
      ['Synthetic Carpet', 'Mohawk', 'Flooring', 18.0],
      ['Bamboo Flooring', 'Cali Bamboo', 'Flooring', 10.0],
      ['Disposable Plastic Produce Bags', 'Safeway', 'Shopping', 0.01],
      ['Reusable Mesh Produce Bags', 'Earthwise', 'Shopping', 0.2],
      ['Bottled Shampoo', 'Head & Shoulders', 'Personal Care', 0.11],
      ['Shampoo Bar', 'Ethique', 'Personal Care', 0.05],
      ['Plastic Bottled Laundry Detergent', 'Persil', 'Laundry', 0.2],
      ['Laundry Detergent Pods', 'Seventh Generation', 'Laundry', 0.15],
      ['Disposable Paper Towels', 'Brawny', 'Kitchen', 0.02],
      ['Reusable Bamboo Towels', 'Bambooee', 'Kitchen', 0.3],
      ['Single-Use Plastic Food Wrap', 'Saran Wrap', 'Kitchen', 0.03],
      ['Reusable Silicone Food Covers', 'Lékué', 'Kitchen', 0.2],
      // Additional drinks
      ['Coca-Cola (Can)', 'The Coca-Cola Company', 'Beverage', 0.17],
      ['Pepsi (Bottle)', 'PepsiCo', 'Beverage', 0.20],
      ['Bottled Water', 'Nestlé', 'Beverage', 0.08],
      ['Orange Juice', 'Tropicana', 'Beverage', 0.25],
      ['Beer (Bottle)', 'Heineken', 'Alcoholic Beverage', 0.33],
      ['Wine (Bottle)', 'E&J Gallo Winery', 'Alcoholic Beverage', 1.20],
      ['Energy Drink', 'Red Bull', 'Beverage', 0.28],
      ['Iced Tea', 'Lipton', 'Beverage', 0.15],
      ['Coffee (Ground)', 'Starbucks', 'Beverage', 0.70],
      ['Plant-based Milk', 'Oatly', 'Beverage', 0.18],
      // Food ingredients
      ['White Sugar', 'Domino Sugar', 'Food Ingredient', 0.57],
      ['All-Purpose Flour', 'King Arthur', 'Food Ingredient', 0.35],
      ['Olive Oil', 'Bertolli', 'Food Ingredient', 1.50],
      ['Table Salt', 'Morton', 'Food Ingredient', 0.04],
      ['Black Pepper', 'McCormick', 'Food Ingredient', 0.80],
      ['Butter', "Land O'Lakes", 'Food Ingredient', 9.20],
      ['Eggs (Dozen)', "Eggland's Best", 'Food Ingredient', 2.70],
      ['Milk (Gallon)', 'Dairy Pure', 'Food Ingredient', 2.50],
      ['Soy Sauce', 'Kikkoman', 'Food Ingredient', 0.62],
      ['Tomato Ketchup', 'Heinz', 'Food Ingredient', 0.38],
      // Additional food items
      ['Potato Chips', "Lay's", 'Snack', 0.75],
      ['Chocolate Bar', "Hershey's", 'Confectionery', 0.95],
      ['Cereal', "Kellogg's", 'Breakfast', 0.45],
      ['Yogurt', 'Danone', 'Dairy', 0.32],
      ['Canned Soup', "Campbell's", 'Canned Food', 0.55],
      ['Frozen Pizza', 'DiGiorno', 'Frozen Food', 2.10],
      ['Ice Cream', "Ben & Jerry's", 'Dessert', 1.80],
      ['Peanut Butter', 'Jif', 'Spread', 0.72],
      ['Pasta', 'Barilla', 'Dry Goods', 0.40],
      ['Rice', "Uncle Ben's", 'Grain', 0.62],
      // More everyday items
      ['Toothpaste', 'Colgate', 'Personal Care', 0.08],
      ['Shampoo', 'Pantene', 'Personal Care', 0.11],
      ['Toilet Paper', 'Charmin', 'Household', 0.18],
      ['Laundry Detergent', 'Tide', 'Household', 0.60],
      ['Dish Soap', 'Dawn', 'Household', 0.15],
      ['Hand Sanitizer', 'Purell', 'Personal Care', 0.05],
      ['Sunscreen', 'Neutrogena', 'Personal Care', 0.25],
      ['Insect Repellent', 'OFF!', 'Personal Care', 0.20],
      ['Air Freshener', 'Febreze', 'Household', 0.10],
      ['Cleaning Spray', 'Lysol', 'Household', 0.18]
    ];

    for (const product of productData) {
      await db.query(
        'INSERT INTO products (name, company, type, carbon_footprint, user_id) VALUES (?, ?, ?, ?, ?)',
        [...product, adminUserId]
      );
    }

    // Insert ingredient data
    const ingredientData = [
      ['Natural Flavors', false],
      ['Citric Acid', false],
      ['Vitamin C', false],
      ['BHA (Butylated Hydroxyanisole)', true],
      ['Water', false],
      ['Artificial Colors', true],
      ['Sodium Nitrite', true],
      ['Salt', false],
      ['Lithium', true],
      ['Nickel', true],
      ['Cobalt', true],
      ['Lead', true],
      ['Mercury', true],
      ['Beryllium', true],
      ['Phthalates', true],
      ['BPA', true],
      ['Phosphor', true],
      ['Ink', false],
      ['Binding Glue', false]
  ];

    for (const ingredient of ingredientData) {
      await db.query(
          'INSERT INTO ingredients (name, is_harmful) VALUES (?, ?)',
          [ingredient[0], ingredient[1]]
      );
    }

    for (const [name, company, type, carbon_footprint] of productData) {
      await db.query(
        'INSERT INTO products (name, company, type, carbon_footprint, user_id) VALUES (?, ?, ?, ?, ?)',
        [name, company, type, carbon_footprint, adminUserId]
      );
    }

    const productIngredients = [
      ['Organic Apple', ['Pesticide Residue']],
      ['Plastic Water Bottle', ['Bisphenol A (BPA)']],
      ['Cotton T-Shirt', ['Formaldehyde', 'Synthetic Dyes']],
      ['Beef Steak', ['Sodium Nitrite', 'Antibiotics']],
      ['Electric Car', ['Heavy Metals in Batteries (e.g., Lithium, Cobalt)']],
      ['Smartphone', ['Phthalates', 'Lead']],
      ['Laptop', ['Cadmium', 'Beryllium']],
      ['Washing Machine', ['Flame Retardants']],
      ['LED Light Bulb', ['Mercury']],
      ['Paper Book', ['Ink with Volatile Organic Compounds (VOCs)']],
      ['Aluminum Can', ['Bisphenol A (BPA)']],
      ['Glass Bottle', ['None (Generally Safe)']],
      ['Plastic Bag', ['Phthalates']],
      ['Reusable Cloth Bag', ['Synthetic Dyes']],
      ['Banana', ['Pesticide Residue']],
      ['Gasoline Car', ['Benzene', 'Lead']],
      ['Solar Panel', ['Cadmium Telluride']],
      ['Disposable Diaper', ['Dioxins', 'Phthalates']],
      ['Cloth Diaper', ['Synthetic Dyes']],
      ['Plastic Straw', ['Phthalates']],
      ['Metal Straw', ['None (Generally Safe)']],
      ['Single-Use Coffee Pod', ['Polystyrene']],
      ['Reusable Coffee Filter', ['None (Generally Safe)']],
      ['Toothbrush (Plastic)', ['Bisphenol A (BPA)']],
      ['Toothbrush (Bamboo)', ['None (Generally Safe)']],
      ['Shampoo Bottle', ['Parabens', 'Sulfates']],
      ['Shampoo Bar', ['None (Generally Safe)']],
      ['Cigarettes', ['Nicotine', 'Tar']],
      ['E-cigarette', ['Nicotine', 'Propylene Glycol']],
      ['Disposable Razor', ['Phthalates']],
      ['Safety Razor', ['None (Generally Safe)']],
      ['Synthetic Fertilizer', ['Ammonium Nitrate']],
      ['Organic Compost', ['None (Generally Safe)']],
      ['Plastic Toys', ['Phthalates', 'Lead']],
      ['Wooden Toys', ['None (Generally Safe)']],
      ['Fast Fashion Dress', ['Synthetic Dyes', 'Formaldehyde']],
      ['Sustainable Fashion Dress', ['None (Generally Safe)']],
      ['Disposable Face Mask', ['Polypropylene']],
      ['Reusable Cloth Mask', ['Synthetic Dyes']],
      ['Plastic Food Container', ['Bisphenol A (BPA)']],
      ['Glass Food Container', ['None (Generally Safe)']],
      ['Single-Use Plastic Cutlery', ['Polystyrene']],
      ['Reusable Metal Cutlery', ['None (Generally Safe)']],
      ['Bottled Soda', ['High Fructose Corn Syrup', 'Artificial Colors']],
      ['Soda Stream', ['None (Generally Safe)']],
      ['Disposable Ballpoint Pen', ['Ink with Volatile Organic Compounds (VOCs)']],
      ['Refillable Fountain Pen', ['None (Generally Safe)']],
      ['Paper Napkins', ['Bleach Residue']],
      ['Cloth Napkins', ['Synthetic Dyes']],
      ['Single-Use Batteries', ['Mercury']],
      ['Rechargeable Batteries', ['Cadmium']],
      ['Incandescent Light Bulb', ['Mercury']],
      ['Smart LED Bulb', ['None (Generally Safe)']],
      ['Gas Lawn Mower', ['Benzene']],
      ['Electric Lawn Mower', ['None (Generally Safe)']],
      ['Plastic Toothpaste Tube', ['Phthalates']],
      ['Metal Toothpaste Tube', ['None (Generally Safe)']],
      ['Disposable Camera', ['Phthalates']],
      ['Digital Camera', ['Lead']],
      ['Paper Coffee Cup', ['Polyethylene']],
      ['Reusable Coffee Mug', ['None (Generally Safe)']],
      ['Plastic Cling Wrap', ['Phthalates']],
      ['Beeswax Wrap', ['None (Generally Safe)']],
      ['Styrofoam Cooler', ['Polystyrene']],
      ['Reusable Cooler', ['None (Generally Safe)']],
      ['Disposable Chopsticks', ['None (Generally Safe)']],
      ['Reusable Chopsticks', ['None (Generally Safe)']],
      ['Dryer Sheets', ['Benzyl Acetate', 'Limonene']],
      ['Wool Dryer Balls', ['None (Generally Safe)']],
      ['Plastic Floss', ['Polytetrafluoroethylene (PTFE)']],
      ['Silk Floss', ['None (Generally Safe)']],
      ['K-Cup Coffee Maker', ['Bisphenol A (BPA)']],
      ['French Press', ['None (Generally Safe)']],
      ['Single-Use Plastic Water Filter', ['Activated Carbon Dust']],
      ['Long-Life Water Filter', ['None (Generally Safe)']],
      ['Disposable Cleaning Wipes', ['Quaternary Ammonium Compounds']],
      ['Reusable Cleaning Cloths', ['None (Generally Safe)']],
      ['Plastic Shower Curtain', ['Phthalates']],
      ['Fabric Shower Curtain', ['Synthetic Dyes']],
      ['Disposable Plastic Razor', ['Phthalates']],
      ['Electric Razor', ['None (Generally Safe)']],
      ['Aerosol Deodorant', ['Aluminum Compounds', 'Parabens']],
      ['Natural Deodorant Stick', ['None (Generally Safe)']],
      ['Plastic Laundry Detergent Bottle', ['Phthalates']],
      ['Laundry Detergent Sheets', ['None (Generally Safe)']],
      ['Disposable Aluminum Baking Tray', ['None (Generally Safe)']],
      ['Silicone Baking Mat', ['None (Generally Safe)']],
      ['Plastic Dish Sponge', ['Phthalates']],
      ['Natural Loofah', ['None (Generally Safe)']],
      ['Synthetic Carpet', ['Formaldehyde']],
      ['Bamboo Flooring', ['None (Generally Safe)']],
      ['Disposable Plastic Produce Bags', ['Phthalates']],
      ['Reusable Mesh Produce Bags', ['None (Generally Safe)']],
      ['Bottled Shampoo', ['Parabens', 'Sulfates']],
      ['Shampoo Bar', ['None (Generally Safe)']],
      ['Plastic Bottled Laundry Detergent', ['Phthalates']],
      ['Laundry Detergent Pods', ['None (Generally Safe)']],
      ['Disposable Paper Towels', ['Bleach Residue']],
      ['Reusable Bamboo Towels', ['None (Generally Safe)']],
      ['Single-Use Plastic Food Wrap', ['Phthalates']],
      ['Reusable Silicone Food Covers', ['None (Generally Safe)']],
      ['Coca-Cola (Can)', ['High Fructose Corn Syrup', 'Caramel Color']],
      ['Pepsi (Bottle)', ['High Fructose Corn Syrup', 'Caramel Color']],
      ['Bottled Water', ['None (Generally Safe)']],
      ['Orange Juice', ['Ascorbic Acid (Vitamin C)']],
      ['Beer (Bottle)', ['None (Generally Safe)']],
      ['Wine (Bottle)', ['Sulfites']],
      ['Energy Drink', ['Caffeine', 'Artificial Colors']],
      ['Iced Tea', ['Artificial Sweeteners']],
      ['Coffee (Ground)', ['None (Generally Safe)']],
      ['Plant-based Milk', ['Calcium Carbonate', 'Potassium Citrate']],
      ['White Sugar', ['None (Generally Safe)']],
      ['All-Purpose Flour', ['None (Generally Safe)']],
      ['Olive Oil', ['None (Generally Safe)']],
      ['Table Salt', ['None (Generally Safe)']],
      ['Black Pepper', ['None (Generally Safe)']],
      ['Butter', ['None (Generally Safe)']],
      ['Eggs (Dozen)', ['None (Generally Safe)']],
      ['Milk (Gallon)', ['None (Generally Safe)']],
      ['Soy Sauce', ['Sodium']],
      ['Tomato Ketchup', ['High Fructose Corn Syrup']],
      ['Potato Chips', ['Artificial Flavors', 'MSG']],
      ['Chocolate Bar', ['Sugar', 'Artificial Flavors']],
      ['Cereal', ['Sugar', 'Artificial Colors']],
      ['Yogurt', ['Artificial Flavors', 'High Fructose Corn Syrup']],
      ['Canned Soup', ['Monosodium Glutamate (MSG)']],
      ['Frozen Pizza', ['Preservatives', 'Artificial Flavors']],
      ['Ice Cream', ['Artificial Flavors', 'High Fructose Corn Syrup']],
      ['Peanut Butter', ['Hydrogenated Oils']],
      ['Pasta', ['None (Generally Safe)']],
      ['Rice', ['None (Generally Safe)']],
      ['Toothpaste', ['Fluoride', 'Sodium Lauryl Sulfate (SLS)']],
      ['Shampoo', ['Parabens', 'Sulfates']],
      ['Toilet Paper', ['Bleach Residue']],
      ['Laundry Detergent', ['Phthalates']],
      ['Dish Soap', ['Sodium Lauryl Sulfate (SLS)']],
      ['Hand Sanitizer', ['Triclosan']],
      ['Sunscreen', ['Oxybenzone']],
      ['Insect Repellent', ['DEET']],
      ['Air Freshener', ['Phthalates']],
      ['Cleaning Spray', ['Ammonia', 'Bleach']]
    ];


    for (const [productName, ingredients] of productIngredients) {
      await db.query(`
        INSERT INTO product_ingredients (product_id, ingredient_id)
        SELECT p.id, i.id
        FROM products p, ingredients i
        WHERE p.name = ? AND i.name IN (?)
      `, [productName, ingredients]);
    }

    console.log('Database setup completed successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

setupDatabase();