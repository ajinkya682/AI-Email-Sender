import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends a WhatsApp message using Meta's Cloud API
 * @param {Object} params - The message parameters
 * @param {string} params.to - The recipient phone number with country code
 * @param {string} params.message - The text message to send
 * @returns {Promise<Object>} Object containing success status, message, and API data
 */
export const sendWhatsAppMessage = async ({ to, message }) => {
  try {
    const token = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      return {
        success: false,
        message: "Missing Meta WhatsApp API credentials in environment variables.",
        data: null
      };
    }

    if (!to || !message) {
      return {
        success: false,
        message: "Missing recipient phone number or message content.",
        data: null
      };
    }

    // Sanitize phone number (remove +, spaces, dashes, parentheses)
    let cleanPhone = to.toString().replace(/\D/g, '');
    
    // Auto prefix 91 if it's a 10-digit Indian number
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const payload = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: { body: message }
    };

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      message: "WhatsApp message sent successfully",
      data: response.data
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        message: "Token expired or invalid",
        data: error.response?.data || null
      };
    }

    let errorDetail = error.message;
    if (error.response && error.response.data && error.response.data.error) {
      const metaError = error.response.data.error;
      errorDetail = `${metaError.message} (Code: ${metaError.code})`;
      if (metaError.error_data && metaError.error_data.details) {
        errorDetail += ` - ${metaError.error_data.details}`;
      }
    }

    return {
      success: false,
      message: `Meta API Error: ${errorDetail}`,
      data: error.response?.data || null
    };
  }
};
