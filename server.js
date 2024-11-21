const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const carbonFootprintRoutes = require('./routes/carbonFootprint');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const articleRoutes = require('./routes/articles');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/carbon-footprint', carbonFootprintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/articles', articleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});