const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class UserController {
  getAll = asyncHandler(async (req, res) => {
    const result = await userService.getAll(req.query);
    ApiResponse.paginated(res, result.users, result.pagination, 'Users fetched successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    ApiResponse.success(res, user, 'User fetched successfully');
  });

  update = asyncHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    ApiResponse.success(res, user, 'User updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await userService.delete(req.params.id);
    ApiResponse.success(res, null, 'User deleted successfully');
  });
}

module.exports = new UserController();
