const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic route
const authRoutes = require('./src/routes/authRoutes');
const storefrontRoutes = require('./src/routes/storefrontRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const accountRoutes = require('./src/routes/accountRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/account', accountRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
