// Chatbot controller with predefined responses
const chatbotResponses = {
  greeting: [
    "Hello! How can I assist you today?",
    "Hi there! What can I help you with?",
    "Hey! How may I help you?"
  ],
  help: [
    "I can help you with account information, navigation, features, and general queries. What would you like to know?",
    "I'm here to assist you with any questions about the platform. Feel free to ask!"
  ],
  account: [
    "You can manage your account settings from the dashboard. Need help with something specific?",
    "Your account information includes your username, email, and profile settings. What would you like to update?"
  ],
  features: [
    "Our platform offers various features including user authentication, profile management, and more. What feature are you interested in?",
    "We have many exciting features! Is there a specific one you'd like to learn about?"
  ],
  default: [
    "I'm here to help! Could you please provide more details?",
    "That's an interesting question! Let me help you with that.",
    "I'm not sure I understand completely. Could you rephrase that?",
    "Thanks for your message! I'm still learning, but I'll do my best to assist you."
  ]
};

// Simple keyword-based response logic
const getResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  // Check for greetings
  if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
    return chatbotResponses.greeting[Math.floor(Math.random() * chatbotResponses.greeting.length)];
  }

  // Check for help
  if (lowerMessage.match(/\b(help|assist|support)\b/)) {
    return chatbotResponses.help[Math.floor(Math.random() * chatbotResponses.help.length)];
  }

  // Check for account queries
  if (lowerMessage.match(/\b(account|profile|settings|password)\b/)) {
    return chatbotResponses.account[Math.floor(Math.random() * chatbotResponses.account.length)];
  }

  // Check for features
  if (lowerMessage.match(/\b(feature|what can|capabilities|what do)\b/)) {
    return chatbotResponses.features[Math.floor(Math.random() * chatbotResponses.features.length)];
  }

  // Default response
  return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)];
};

// Handle chat message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get bot response
    const botResponse = getResponse(message);

    // Simulate processing delay for more realistic feel
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: botResponse,
        timestamp: new Date().toISOString()
      });
    }, 500);

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
};

// Get chatbot status
exports.getStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      status: 'online',
      message: 'Chatbot is ready to assist you'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get status'
    });
  }
};
