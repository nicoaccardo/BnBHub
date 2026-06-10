require('dotenv').config();
const { validateSecurityConfig } = require('./config/security');

validateSecurityConfig();

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT);
