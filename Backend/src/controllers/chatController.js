import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import EmailLog from '../models/EmailLog.js';
import { analyzeIntent, doWebSearch, draftEmail, generateChatResponse } from '../services/aiService.js';
import { sendEmail } from '../services/emailService.js';

// @desc    Get all conversations for user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user.id }).sort('-updatedAt');
    res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversation: req.params.id }).sort('createdAt');
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message and get AI response
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { content, conversationId } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Please provide message content' });
    }

    let convId = conversationId;
    if (!convId) {
      const newConv = await Conversation.create({
        user: req.user.id,
        title: content.substring(0, 30) + '...'
      });
      convId = newConv._id;
    }

    // Save user message
    const userMessage = await Message.create({
      conversation: convId,
      role: 'user',
      content
    });

    // 1. Analyze Intent
    const intentData = await analyzeIntent(content);
    
    let aiResponseContent = '';
    let aiMetadata = { intent: intentData.intent };

    if (intentData.intent === 'SEND_EMAIL' && intentData.recipientEmail) {
      // It's an email command!
      const topicToSearch = intentData.topic || 'General knowledge';
      
      // 2. Perform Web Search / Context Gathering
      const searchContext = await doWebSearch(topicToSearch);
      
      // 3. Draft Email HTML
      const htmlBody = await draftEmail(intentData.topic, searchContext, intentData.recipientEmail);
      
      const subject = intentData.subject || 'Information from AI Assistant';
      
      // 4. Send Email via NodeMailer
      try {
        await sendEmail({
          to: intentData.recipientEmail,
          subject,
          html: htmlBody
        });
        
        // Log to DB
        await EmailLog.create({
          user: req.user.id,
          to: intentData.recipientEmail,
          subject,
          body: htmlBody,
          status: 'sent'
        });

        aiResponseContent = `✅ Successfully drafted and sent an email to **${intentData.recipientEmail}**. \n\n**Subject:** ${subject}\n\nI researched the topic using Tavily and formatted the response as a professional email.`;
        aiMetadata.emailStatus = 'sent';
      } catch (err) {
        console.error('Email sending failed:', err);
        aiResponseContent = `❌ Failed to send email to ${intentData.recipientEmail}. Error: ${err.message}`;
        aiMetadata.emailStatus = 'failed';
        
        // Log failure to DB
        await EmailLog.create({
          user: req.user.id,
          to: intentData.recipientEmail,
          subject,
          body: htmlBody,
          status: 'failed'
        });
      }

    } else {
      // Standard Chat
      // Assemble history
      const historyMsg = await Message.find({ conversation: convId }).sort('createdAt').limit(10);
      const historyStr = historyMsg.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      
      // Get AI response
      aiResponseContent = await generateChatResponse(historyStr);
    }

    // Save AI message
    const aiMessage = await Message.create({
      conversation: convId,
      role: 'assistant',
      content: aiResponseContent,
      metadata: aiMetadata
    });

    // Update conversation timestamp
    await Conversation.findByIdAndUpdate(convId, { updatedAt: Date.now() });

    res.status(200).json({
      success: true,
      data: {
        conversationId: convId,
        userMessage,
        aiMessage
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Delete a conversation and its messages
// @route   DELETE /api/chat/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Make sure the conversation belongs to the requesting user
    if (conversation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Cascade delete all messages in this conversation
    await Message.deleteMany({ conversation: req.params.id });

    // Delete the conversation itself
    await Conversation.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
