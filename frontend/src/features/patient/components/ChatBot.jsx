import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaExclamationTriangle, FaTrash, FaChevronUp } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import useChat from "../hooks/useChat";
import { MarkdownText } from "../../../utils/markdownFormatter.jsx";

/**
 * ChatBot Component - AI Assistant Dropdown (Refactored)
 * Dropdown chatbot for patient assistance in navbar
 * متكامل مع Backend API مع pagination support
 */
const ChatBot = ({ onClose, isDropdown = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesContainerRef = useRef(null);

  // استخدام useChat hook
  const {
    messages,
    pagination,
    isSending,
    error,
    sendMessage,
    loadMoreMessages,
    clearChat,
    clearError,
    setContext,
    hasMessages,
    hasMoreMessages,
    isLoading,
    isLoadingMore,
  } = useChat({
    autoFetchHistory: true, // جلب التاريخ تلقائياً
  });

  // تحديث الـ context عند تغيير الصفحة
  useEffect(() => {
    setContext({ currentPage: location.pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Scroll للأسفل عند إرسال رسالة جديدة (داخل الـ container فقط)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      // استخدام setTimeout لضمان تحديث الـ DOM أولاً
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const message = inputMessage;
    setInputMessage('');

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChat();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleLoadMore = async () => {
    try {
      await loadMoreMessages();
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  };

  // معالجة الـ Actions من الـ AI
  const handleAction = (action) => {
    console.log('🎯 Executing action:', action);

    switch (action.type) {
      case 'navigate':
        if (action.route) {
          navigate(action.route);
        }
        break;
      
      case 'open-modal':
        console.log('Open modal:', action.data);
        break;
      
      case 'filter':
        console.log('Apply filter:', action.data);
        break;
      
      default:
        console.log('Unknown action type:', action.type);
    }
  };

  const handleQuickAction = (text) => {
    setInputMessage(text);
  };

  // رسالة ترحيب افتراضية (فقط إذا لم يكن هناك رسائل ولا تحميل)
  const welcomeMessage = {
    messageId: 'welcome',
    role: 'assistant',
    content: 'مرحباً! أنا **شُريان**، مساعدك الطبي الافتراضي. يرجي ملاحظة أنني لا اغني عن استشارة الطبيب.\n\nكيف يمكنني مساعدتك اليوم؟',
    timestamp: new Date().toISOString(),
    suggestions: [],
    actions: [],
  };

  const displayMessages = (!hasMessages && !isLoading) ? [welcomeMessage] : messages;

  return (
    <div className="w-full h-[500px] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col relative" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00d5be] to-[#00bfaa] px-4 py-3 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <FaRobot className="text-white text-xxl" />
            </div>
            <div>
              <h3 className="text-white text-xl font-black text-base">شُريان - مساعدك الطبي</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Clear Chat Button */}
            {hasMessages && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                aria-label="مسح المحادثة"
                title="مسح المحادثة"
              >
                <FaTrash className="text-sm" />
              </button>
            )}
            {/* Close button for dropdown */}
            {isDropdown && onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="إغلاق"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 min-h-0">
        {/* Loading State */}
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#00d5be] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-600 text-sm font-medium">جاري تحميل المحادثة...</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMoreMessages && !isLoading && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <>
                  <FaChevronUp className="text-xs" />
                  <span>تحميل رسائل أقدم</span>
                </>
              )}
            </button>
          </div>
        )}

        {displayMessages.map((message) => (
          <div key={message.messageId}>
            <div
              className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`
                    rounded-2xl px-4 py-3 shadow-sm
                    ${message.role === 'user'
                      ? 'bg-gradient-to-br from-[#00d5be] to-[#00bfaa] text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                    }
                  `}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{message.content}</p>
                  ) : (
                    <MarkdownText text={message.content} />
                  )}
                </div>
                <span className={`text-xs text-slate-500 mt-1 block ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#00d5be] to-[#00bfaa] rounded-full flex items-center justify-center flex-shrink-0 ml-2 order-2">
                  <FaRobot className="text-white text-sm" />
                </div>
              )}
            </div>

            {/* Suggestions من الـ AI */}
            {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
              <div className="mr-10 mt-2 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(suggestion)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Actions من الـ AI */}
            {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
              <div className="mr-10 mt-2 flex flex-wrap gap-2">
                {message.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(action)}
                    className="px-3 py-1.5 bg-gradient-to-br from-[#00d5be] to-[#00bfaa] hover:from-[#00bfaa] hover:to-[#00d5be] text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    {action.label || action.type}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isSending && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00d5be] to-[#00bfaa] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                <FaRobot className="text-white text-sm" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-200">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <FaExclamationTriangle className="text-red-500 text-sm mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-700 font-semibold mt-1"
              >
                إخفاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-2">مسح المحادثة؟</h3>
            <p className="text-sm text-slate-600 mb-4">هل أنت متأكد من مسح كل الرسائل؟ لن تتمكن من استرجاعها.</p>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                مسح
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - تظهر فقط في البداية */}
      {!hasMessages && !isLoading && (
        <div className="px-3 py-2 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('كيف أحجز موعد؟')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1"
            >
              <span>كيف أحجز موعد؟</span>
            </button>
            <button
              onClick={() => handleQuickAction('أين أجد روشتاتي؟')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1"
            >
              <span>أين أجد روشتاتي؟</span>
            </button>
            <button
              onClick={() => handleQuickAction('كيف أبحث عن طبيب؟')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1"
            >
              <span>كيف أبحث عن طبيب؟</span>
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-[#00d5be] focus:ring-2 focus:ring-[#00d5be]/20 transition-all text-sm font-medium"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="w-10 h-10 bg-gradient-to-br from-[#00d5be] to-[#00bfaa] rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex-shrink-0"
          >
            <FaPaperPlane className="text-white text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;