const bcrypt = require('bcrypt');
const UserModel = require('../models/user-model');
const uuid  = require('uuid');
const EmailService = require('./email-service');
const TokenService = require('./token-service');
const UserDTO = require('../dtos/user-dto');
const ApiError = require('../exaptions/api-error');

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequestError(`User with email:${email} already registered`);
    }
    const hashedPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await UserModel.create({ email, password: hashedPassword, activationLink });
    await EmailService.sendActivationEmail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    return this.__getUserAndTokens(user);
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw  ApiError.BadRequestError('Activation link is not correct');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email,password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequestError(`User with email:${email} not found`);
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequestError('Incorrect password');
    }
    return this.__getUserAndTokens(user);
  }

  async logout(refreshToken) {
    const token = await TokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await TokenService.findToken(refreshToken);

    if (!userData && !tokenFromDB) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    return this.__getUserAndTokens(user);
  }

  async getAllUsers() {
    return UserModel.find();
  }

  async __getUserAndTokens(user) {
    const userDTO = new UserDTO(user);
    const tokens = TokenService.generateTokens({ ...userDTO });
    await TokenService.saveToken(userDTO.id, tokens.refreshToken);

    return { ...tokens, user: userDTO };
  }
}

module.exports = new UserService();