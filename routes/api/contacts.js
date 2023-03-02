const express = require("express");
const router = express.Router();

const {
  getAll,
  getById,
  add,
  updateById,
  updateStatusContact,
  deleteById,
} = require("../../controllers/contacts");
const {schemas} = require("../../models/contact");
const validateBody = require("../../middlewares/validateBody")
const isValidId = require("../../middlewares/isValidId");


router.get("/", getAll);

router.get("/:contactId", isValidId, getById);

router.post("/", validateBody(schemas.addSchema), add);

router.put("/:contactId",
  isValidId, validateBody(schemas.updateSchema), updateById
);

router.patch("/:contactId/favorite",
  validateBody(schemas.updateFavorite), updateStatusContact
);

router.delete("/:contactId", isValidId, deleteById);

module.exports = router;
