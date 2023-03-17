const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User} = require("../models/user");
const {HttpError, ctrlWrapper} = require("../helpers");
const gravatar = require('gravatar');
const path = require("path");
const fs = require("fs/promises");
var Jimp = require("jimp");

require("dotenv").config();

const {SECRET_KEY} = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "This email is already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const newUser = await User.create({...req.body, password: hashPassword, avatarURL});
    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
        subscription: newUser.subscription,
    })
}

const login = async(req,res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "Email or password is not valid");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password is not valid");
    }
    const payload = {
        id: user._id,
    }
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "30d"});
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
        token,
        user: {
            email: user.email,
            subscription: user.subscription,
          }, 
    })
}

const getCurrent = async (req,res) => {
    const {email, name} = req.user;
    res.json({
        email, name, subscription
    })
}

const updateSubscription = async (req, res) => {
    const { subscription } = req.body;
    const { _id } = req.user;
    const subscriptionList = ["starter", "pro", "business"];
    if (!subscriptionList.includes(subscription)) {
        throw HttpError(400, "This subscription type doesn't exist");
    }
    const user = await User.findByIdAndUpdate(_id, { subscription }, {new: true});
    res.json({
      email: user.email,
      subscription: user.subscription,
    });
}

const updateAvatar = async (req,res) => {
    const {_id} = req.user;
    const {path: tempUpload, originalname} = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    Jimp.read(resultUpload, (err, avatar) => {
        if (err) throw err;
          avatar.resize(250, 250).write(resultUpload);
      });
    await User.findByIdAndUpdate(_id, {avatarURL});
    res.json({avatarURL});
}

const logout = async (req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.status(204).json({
        message: "Logout success"
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    updateSubscription: ctrlWrapper(updateSubscription),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}