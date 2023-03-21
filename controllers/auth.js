const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User} = require("../models/user");
const {HttpError, ctrlWrapper, sendEmail} = require("../helpers");
const gravatar = require('gravatar');
const path = require("path");
const fs = require("fs/promises");
var Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");


require("dotenv").config();

const {SECRET_KEY, BASE_URL} = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "This email is already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = uuidv4();
    const newUser = await User.create({...req.body, password: hashPassword, avatarURL, verificationToken });
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);
    
    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
        subscription: newUser.subscription,
    })
}

const verifyEmail = async(req,res) => {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});
    if (!user) {
        throw HttpError (404, "User not found");
    }
    await User.findByIdAndUpdate (user._id, {verify: true, verificationToken: ""});

    res.json({message: "Verification successful"})
}

const resendVerifyEmail = async(req, res) => {
    const {email} = req.body;
    if (!email) {
        throw HttpError(400, "missing required field email");
      }
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError (404, "Email not found");
    }
    if(user.verify) {
        throw HttpError (400, "Verification has already been passed");
    }
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

    res.json({message: "Verify email sent success"});
}

const login = async(req,res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "Email or password is not valid");
    }
    if (!user.verify) {
        throw HttpError (401, "Email is not verified");
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
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    updateSubscription: ctrlWrapper(updateSubscription),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}