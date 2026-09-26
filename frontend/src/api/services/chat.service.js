import apiClient from "../client";

const chatService = {
  async sendMessage(data) {
    try {
      console.log('📤 [SendMessage] Sending message to AI Bot:', data);
      
      const response = await apiClient.post('/Chat/send-message', {
        message: data.message,
        context: data.context || {}
      });

      console.log('✅ [SendMessage] AI Bot response:', response.data);
      
      return response.data?.data || null;
    } catch (error) {
      console.error('❌ [SendMessage] Error:', error);
      throw error;
    }
  },


  async getChatHistory(pageNumber = 1, pageSize = 50) {
    try {
      console.log(`📥 [ChatHistory] Fetching page ${pageNumber} (size: ${pageSize})`);
      
      const response = await apiClient.get('/Chat/history', {
        params: { pageNumber, pageSize }
      });
      
      console.log('✅ [ChatHistory] Data received:', response.data);
      
      return response.data?.data || null;
    } catch (error) {
      console.error('❌ [ChatHistory] Error:', error);
      throw error;
    }
  },


  async clearChat() {
    try {
      console.log('🧹 [ClearChat] Clearing entire chat history');
      
      const response = await apiClient.delete('/Chat/clear');
      
      console.log('✅ [ClearChat] Chat cleared successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [ClearChat] Error:', error);
      throw error;
    }
  }
};

export default chatService;
