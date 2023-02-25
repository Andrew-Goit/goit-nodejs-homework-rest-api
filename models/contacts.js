const fs = require('fs/promises');
const path = require('path');
const { v4 } = require('uuid');

const contactsPath = path.join(__dirname, './contacts.json');

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const contacts = JSON.parse(data);
  return contacts;
}

const getContactById = async (contactId) => {
  const data = await listContacts();
  const contact = data.find(item => item.id === contactId);
  if(!contact) {return null};
  return contact;
}

const addContact = async (body) => {
  const data = await listContacts();
  const newContact = {id: v4(), ...body}
  data.push(newContact)
  fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
  return newContact;
}

const updateContact = async (contactId, body) => {
  const data = await listContacts();
  const index = data.findIndex(item => item.id === contactId);
  if (index===-1) {return null};
  const updatedContact = {...data[index], ...body};
  data.splice(index, 1, updatedContact);
  fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
  return updatedContact;
}

const removeContact = async (contactId) => {
  const data = await listContacts();
  const index = data.findIndex(item => item.id === contactId);
  if (index===-1) {return null};
  const deletedContact = data.splice(index, 1);
  fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
  return deletedContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
