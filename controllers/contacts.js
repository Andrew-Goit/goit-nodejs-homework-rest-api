const {Contact} = require("../models/contact");
const ctrlWrapper = require("../helpers/ctrlWrapper");
const HttpError = require("../helpers/HttpError");

const getAll = async (req, res, next) => {
  const {_id: owner} = req.user;
  const {page=1, limit = 5, favorite} = req.query;
  const skip = (page - 1) * limit;
  const filter = {owner};
  if (favorite) {
    filter.favorite = favorite;
  };
  const contactsList = await Contact.find(filter, "",  {skip, limit})
  // .populate("owner", "name");
  res.json(contactsList);
};

const getById = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const contact = await Contact.findOne({_id: contactId,  owner});
  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.json(contact);
};

const add = async (req, res, next) => {
  const {_id: owner} = req.user;
  // if (!req.body.favorite) {
  //   req.body.favorite = false;
  // }
  const newContact = await Contact.create({...req.body, owner});
  res.status(201).json(newContact);
};

const updateById = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "Missing fields");
  }
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const updateContact = await Contact.findOneAndUpdate({ _id: contactId, owner }, 
    req.body, 
    {new: true,});
  if (!updateContact) {
    throw HttpError(404, "Not found");
  }
  res.json(updateContact);
};

const updateStatusContact = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "Missing field favorite");
  }
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const updateContact = await Contact.findOneAndUpdate({ _id: contactId, owner }, req.body, {
    new: true,
  });
  if (!updateContact) {
    throw HttpError(404, "Not found");
  }
  res.json(updateContact);
};

const deleteById = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const deletedContact = await Contact.findOneAndRemove({
    _id: contactId, owner})
  if (!deletedContact) {
    throw HttpError(404, "Not found");
  }
  res.json({ message: "contact deleted" });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteById: ctrlWrapper(deleteById),
};