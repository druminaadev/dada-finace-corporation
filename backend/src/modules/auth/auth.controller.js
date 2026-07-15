import authService from './auth.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.success(res, user, 'User registered successfully', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, req.ip);
  res.cookie('refreshToken', result.refreshToken, result.refreshCookieOptions);
  ApiResponse.success(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const result = await authService.refreshToken(token, req.ip);
  res.cookie('refreshToken', result.refreshToken, result.refreshCookieOptions);
  ApiResponse.success(res, { accessToken: result.accessToken }, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(req.user.id, token, req.ip);
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/v1/auth/refresh' });
  ApiResponse.success(res, null, 'Logged out successfully');
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id, req.ip);
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/v1/auth/refresh' });
  ApiResponse.success(res, null, 'Logged out from all devices');
});

const getProfile = asyncHandler(async (req, res) => {
  ApiResponse.success(res, req.user, 'Profile fetched');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  ApiResponse.success(res, null, 'Password changed successfully');
});

export default { register, login, refreshToken, logout, logoutAll, getProfile, changePassword };
