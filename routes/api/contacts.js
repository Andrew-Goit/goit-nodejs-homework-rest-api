const express = require('express')
const Joi = require('joi');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require('../../models/contacts')

const contacts = require('../../models/contacts');

const router = express.Router()

const postSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(), 
})

const putSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  phone: Joi.string().optional(), 
})

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json({
      status: 'success',
      code: 200,
      data: { contacts },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const {contactId} = req.params;
    const contact = await getContactById(contactId);
    if (!contact) {
      const error = newError('Not found');
      error.status = 404;
      throw error;
    }
    res.status(200).json({
      status: 'success',
      code: 200,
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = 'Missed required field';
      throw error;
    }
    
    const result = await addContact(req.body);
    res.status(201).json({
      status: 'success',
      code: 201,
      data: {result}
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Missing fields');
      error.status = 400;
      throw error;
    }
    const { error } = putSchema.validate(req.body);
    console.log(error);
    if (error) {
      error.status = 400;
      error.message = 'Bad Request. Check all fields';
      throw error;
    }
    const result = await updateContact(contactId, req.body);
    if (!result) {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    }
    res.status(200).json({
      status: 'success',
      code: 201,
      data: { result },
    });
  } catch (error) {
    next(error);
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await removeContact(contactId);
    if (!contact) {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    }
    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'contact deleted',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
})

module.exports = router
