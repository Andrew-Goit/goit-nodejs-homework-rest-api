const express = require('express');

const ctrl = require('../../controllers/auth');
const validateBody = require("../../middlewares/validateBody");
const authenticate = require("../../middlewares/authenticate");
const uploadFile = require ("../../middlewares/uploadFile");
const {schemas} = require('../../models/user');

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.patch("/", authenticate, ctrl.updateSubscription);

router.patch(
    "/avatars", authenticate, uploadFile.single("avatar"), ctrl.updateAvatar
  );

router.post("/logout", authenticate, ctrl.logout)

module.exports = router;
