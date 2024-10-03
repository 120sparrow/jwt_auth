const jwt = require('jsonwebtoken');
const TokenModel = require('../models/token-model');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      {  expiresIn: process.env.JWT_ACCESS_EXPIRES }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {  expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );
    return { accessToken, refreshToken }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await TokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    return TokenModel.create({ user: userId, refreshToken });
  }

  async removeToken(refreshToken) {
    return TokenModel.deleteOne({ refreshToken });
  }

  async findToken(refreshToken) {
    return TokenModel.findOne({ refreshToken });
  }

  validateAccessToken(token) {
    return this.__validateRefreshToken(token, process.env.JWT_ACCESS_SECRET);
  }

  validateRefreshToken(token) {
    return this.__validateRefreshToken(token, process.env.JWT_REFRESH_SECRET);
  }

  __validateRefreshToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (e) {
      return null;
    }
  }
}

module.exports = new TokenService();
