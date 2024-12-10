require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const {logger} = require('../logger.js');


//console.log("DB_NAME:", process.env.DB_NAME);
//console.log("DB_USER:", process.env.DB_USER);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

const checkDbConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connected to database successfully');
        console.log('Connected to database successfully');
        return true;
    } catch (error) {
        logger.error('Connection to database failed:', { error });
        console.error('Connection to database failed:', error);
        return false;
    }
};

const createDatabase = async () => {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
  
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
      logger.info("Database checked/created successfully.");
      console.log("Database checked/created successfully.");
      await createTable();
    } catch (err) {
      logger.error("Error while creating the database:", { message: err.message });
      console.error("Error while creating the database:", err.message);
      throw new Error(err);
    }
  };


// Function to create tables and sync models
const createTable = async () => {
    try {
      await sequelize.sync({ alter: true }); // Sync the models (create tables)
      console.log("Synced Models successfully.");
      logger.info("Synced Models successfully.");
    } catch (err) {
      logger.error("Failed to sync models:", { message: err.message });
      console.error("Failed to sync models:", err.message);
    }
  };


module.exports = { sequelize, checkDbConnection, createDatabase };
