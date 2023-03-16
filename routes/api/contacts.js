const express = require("express");


const ctrl = require("../../controllers/contacts");

const {schemas} = require("../../models/contact");
const validateBody = require("../../middlewares/validateBody");
const authenticate = require("../../middlewares/authenticate");
const isValidId = require("../../middlewares/isValidId");

const router = express.Router();

router.get("/", authenticate, ctrl.getAll);

router.get("/:contactId", authenticate, isValidId, ctrl.getById);

router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.add);

router.put("/:contactId",
authenticate, isValidId, validateBody(schemas.updateSchema), ctrl.updateById
);

router.patch("/:contactId/favorite", authenticate,
  validateBody(schemas.updateFavoriteSchema), ctrl.updateStatusContact
);

router.delete("/:contactId", authenticate, isValidId, ctrl.deleteById);

module.exports = router;
