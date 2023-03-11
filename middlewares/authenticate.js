const {User} = require("../models/user")
const jwt = require("jsonwebtoken");
const {HttpError} = require("../helpers");
const {SECRET_KEY} = process.env;

const authenticate = async (req, res, next) => {
    const {authorization = ""} = req.headers;
    const [bearer, token] = authorization.split(" ");
    if(bearer !== "Bearer") {
        next(HttpError(401, "Unauthorized. Invalid token"))
    }
    try {
        const {id} = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(id);
        if(!user||!user.token|| user.token!== token) {next(HttpError(401, "Unauthorized. Invalid token"))};
        req.user = user;
        next()
    } catch (error) {
        next(HttpError(401, "Unauthorized. Invalid token"))
    }
}

module.exports = authenticate;