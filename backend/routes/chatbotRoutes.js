const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', chatbotController.sendMessage);

// GET /api/chatbot/status - Get chatbot status
router.get('/status', chatbotController.getStatus);

module.exports = router;
