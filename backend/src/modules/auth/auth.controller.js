const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    ApiResponse.success(res, user, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    ApiResponse.success(res, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    ApiResponse.success(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);
    ApiResponse.success(res, null, 'Logout successful');
  });

  getProfile = asyncHandler(async (req, res) => {
    ApiResponse.success(res, req.user, 'Profile fetched successfully');
  });
}

module.exports = new AuthController();
