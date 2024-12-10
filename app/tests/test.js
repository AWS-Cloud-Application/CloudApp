const { createUserController, updateUserController, getUserController } = require('../controller/userController');
const userService = require('../services/userService');

// Mock the functions from userService
jest.mock('../services/userService', () => ({
    createNewUser: jest.fn(),
    getUserById: jest.fn(),
    updateUserDetails: jest.fn(),
}));

describe('User Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
            user: {},
            query: {},
            url: '',
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // Test for createUserController
    describe('createUserController', () => {
        test('should create a user and return 201 status', async () => {
            const mockUser = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password@123'
            };

            // Mock createNewUser to resolve with a user object
            userService.createNewUser.mockResolvedValue(mockUser);

            await createUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                email: mockUser.email,
                account_created: mockUser.account_created,
                account_updated: mockUser.account_updated,
            });
        });

        test('should return 400 status if authorization header is present', async () => {
            req.headers.authorization = 'Basic abc123';
            await createUserController(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Authorization should not be provided for this request.' });
        });

        test('should return 400 status on error', async () => {
            const errorMessage = 'Error creating user';
            userService.createNewUser.mockRejectedValue(new Error(errorMessage));

            await createUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    // Test for updateUserController with Basic Authentication
    describe('updateUserController', () => {
        test('should update user and return 204 status with correct authorization', async () => {
            const username = 'john.doe@example.com';
            const password = 'Password@123';
            req.user.email = username;
            req.body = {
                first_name: 'John',
                last_name: 'Doe',
                password: 'Password@1'
            };

            const base64Token = Buffer.from(`${username}:${password}`).toString('base64');
            req.headers.authorization = `Basic ${base64Token}`;

            userService.updateUserDetails.mockResolvedValue(true);

            await updateUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
        });

        test('should return 400 if query parameters are present', async () => {
            req.query = { someQuery: 'test' };

            await updateUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Query parameters are not allowed in the URL.' });
        });

        test('should return 400 on error', async () => {
            const errorMessage = 'Error updating user';
            const username = 'john.doe@example.com';
            const password = 'Password@123';
            req.user.email = username;
            const base64Token = Buffer.from(`${username}:${password}`).toString('base64');
            req.headers.authorization = `Basic ${base64Token}`;

            userService.updateUserDetails.mockRejectedValue(new Error(errorMessage));

            await updateUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    // Test for getUserController with Basic Authentication
    describe('getUserController', () => {
        test('should return 200 and user data with correct authorization', async () => {
            const mockUser = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password@123'
            };

            // Set basic auth
            const username = 'john.doe@example.com';
            const password = 'Password@123';
            const base64Token = Buffer.from(`${username}:${password}`).toString('base64');
            req.headers.authorization = `Basic ${base64Token}`;

            // Mock getUserById to return the user data
            userService.getUserById.mockResolvedValue(mockUser);

            await getUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should return 400 if query parameters are present', async () => {
            req.query = { someQuery: 'test' };

            await getUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Query parameters are not allowed in the URL.' });
        });

        test('should return 400 on error', async () => {
            const errorMessage = 'Error fetching user';
            const username = 'john.doe@example.com';
            const password = 'Password@123';
            const base64Token = Buffer.from(`${username}:${password}`).toString('base64');
            req.headers.authorization = `Basic ${base64Token}`;

            userService.getUserById.mockRejectedValue(new Error(errorMessage));

            await getUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });
});