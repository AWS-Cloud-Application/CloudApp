const request = require('supertest');
const app = require('../server.js');
const { sequelize } = require('../databaseConfig/databaseConnect.js');
const User = require('../models/userModel.js');
const bcrypt = require('bcrypt');
require('dotenv').config();

describe('User Routes Integration Tests', () => {
  // Reset the database before each test
  beforeEach(async () => {
    await sequelize.sync();
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /user', () => {
    it('should create a user and return 201', async () => {
      const userData = {
        first_name: 'kishor',
        last_name: 'kashid',
        email: 'kishorkashid@gmail.com',
        password: 'Kishor@1',
      };

      const response = await request(app)
        .post('/v1/user')
        .send(userData)
        .expect(201);
    });

    it('should return 400 if invalid data is provided', async () => {
      const invalidUserData = {
        first_name: 'kishor',
        last_name: 'kashid',
        email: 'kishorkashid@gmail.com',
        password: 'Kishor@1',
        age: 25
      };

      const response = await request(app)
        .post('/v1/user')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.message).toContain('Invalid Request Body');
    });
  });

  describe('GET /user/self', () => {
    let user;

    beforeEach(async () => {
      // Insert the user into the database for testing
      user = await User.create({
        first_name: 'kishor',
        last_name: 'kashid',
        email: 'kishorkashid1@gmail.com',
        password: await bcrypt.hash('Kishor@1', 10), // Store the hashed password
      });
      user.verified_user = true;
      await user.save();
    });

    it('should return user data for the authenticated user', async () => {
      // Encode the email and password for Basic Auth
      const base64Token = Buffer.from(`${user.email}:Kishor@1`).toString('base64');

      // Make the request with Basic Auth
      const response = await request(app)
        .get('/v1/user/self')
        .set('Authorization', `Basic ${base64Token}`)
        .expect(200);

      // Validate the response contains the correct user data
      expect(response.body.email).toBe(user.email);
      expect(response.body.first_name).toBe(user.first_name);
      expect(response.body.last_name).toBe(user.last_name);
    });
  });

});

