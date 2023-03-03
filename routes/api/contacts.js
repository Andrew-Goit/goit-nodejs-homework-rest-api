const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/contacts");

const {schemas} = require("../../models/contact");
const validateBody = require("../../middlewares/validateBody")
const isValidId = require("../../middlewares/isValidId");


router.get("/", ctrl.getAll);

router.get("/:contactId", isValidId, ctrl.getById);

router.post("/", validateBody(schemas.addSchema), ctrl.add);

router.put("/:contactId",
  isValidId, validateBody(schemas.updateSchema), ctrl.updateById
);

router.patch("/:contactId/favorite",
  validateBody(schemas.updateFavoriteSchema), ctrl.updateStatusContact
);

router.delete("/:contactId", isValidId, ctrl.deleteById);

module.exports = router;
