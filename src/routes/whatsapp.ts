import express from 'express';
// controllers

import {checkContact, sendMessage, webhookPost, webHookGet} from '../controllers/whatsapp'
const router = express.Router();

router
  .get('/check-contact', checkContact)
  .post('/send-message', sendMessage)
  .post('/webhook', webhookPost)
  .get('/webhook', webHookGet)

export default router;


