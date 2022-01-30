const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service');
const tokenService = require('./token.service');
const UserDto = require('../dtos/use-dto');
const userModel = require('../models/user-model');

class userService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw new Error(` Пользователь с емейлом ${email} уже сущесвует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4()


        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        await mailService.sendActivationMail(email, `http://localhost:5000/api/activate/${activationLink}`);


        const userDto = new UserDto(user)
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto,
        }
    }
    async activate(activationLink) {
        const user = await userModel.findOne({ activationLink })
        if (!user) {
            throw new Error('Неккоректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }
    async login(email, password) {
        const user = await userModel.findOne({ email })
        if (!user) {
            throw new Error('Пользователь с таким емейлом уже найден');
        }
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            throw new Error('Неправильный пароль');
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto,
        }
    }
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new Error('Ошибка');
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw new Error('Ошибка')
        }


        const user = await userModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto,
        }
    }
    async getAllUsers() {
        const users = await userModel.find();
        return users;
    }
}


module.exports = new userService()