var dotenv = require('dotenv');
const app = require('./app');

dotenv.config();
const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });

module.exports = app;
