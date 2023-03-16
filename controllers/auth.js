const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User} = require("../models/user");
const {HttpError, ctrlWrapper} = require("../helpers");

require("dotenv").config();

const {SECRET_KEY} = process.env;

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "This email is already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({...req.body, password: hashPassword});
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
        // id: "64071b1c74bdac186e04d7f1"
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
}