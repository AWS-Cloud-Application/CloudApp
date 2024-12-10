require('dotenv').config({ path: '../.env' });
const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const checkPayload = require('./middleware/routesMiddleware.js');
const userRoutes = require('./routes/userRoutes');
const authenticate = require('./middleware/authMiddleware.js');
const { sequelize } = require('./databaseConfig/databaseConnect.js');
const { createDatabase } = require('./databaseConfig/databaseConnect.js');
const imageRoutes = require('./routes/imageRoutes.js');
const {logger} = require('./logger.js');


createDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.debug({
        message: `Server running successfully on PORT ${PORT}`
      });
      console.log(`Server running successfully on PORT ${PORT}`);
    });
  })
  .catch(err => {
    logger.error({
      message: "Failed to initialize database",
      error: err
    });
    console.error("Failed to initialize database:", err);
  });


const app = express();

app.use(express.json());

app.use(checkPayload);

app.use('/healthz', healthRoutes);

app.use('/v1', userRoutes);

app.use('/v1/user/self/pic', imageRoutes);

app.all('/healthz', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.status(405).send();
});

app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.status(404).send();
});

module.exports = app;