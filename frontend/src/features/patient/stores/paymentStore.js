import { create } from "zustand";
import { devtools } from "zustand/middleware";
import paymentService, { PaymentMethod, PaymentType, PaymentStatus } from "@/api/services/payment.service";

/**
 * Payment Store - Manages payment state and operations
 */
export const usePaymentStore = create(
  devtools(
    (set, get) => ({
      // ==================== STATE ====================

      // Payment details
      currentPayment: null,
      paymentId: null,
      paymentUrl: null,
      referenceNumber: null,

      // Order context
      orderType: null, // 'appointment' | 'pharmacy' | 'lab'
      orderId: null,
      orderAmount: null,

      // Selected payment options
      selectedPaymentMethod: PaymentMethod.ONLINE, // Default: Online
      selectedPaymentType: PaymentType.CARD, // Default: Card

      // UI state
      loading: false,
      error: null,
      isPaymentModalOpen: false,

      // ==================== ACTIONS ====================

      /**
       * Open payment modal for an order
       * @param {string} orderType - 'appointment' | 'pharmacy' | 'lab'
       * @param {string} orderId - Order ID
       * @param {number} amount - Order amount
       */
      openPaymentModal: (orderType, orderId, amount) => {
        console.log('💳 [PaymentStore] Opening payment modal:', { orderType, orderId, amount });
        
        set({
          isPaymentModalOpen: true,
          orderType,
          orderId,
          orderAmount: amount,
          selectedPaymentMethod: PaymentMethod.ONLINE,
          selectedPaymentType: PaymentType.CARD,
          error: null,
        });
      },

      /**
       * Close payment modal
       */
      closePaymentModal: () => {
        console.log('💳 [PaymentStore] Closing payment modal');
        
        set({
          isPaymentModalOpen: false,
          error: null,
        });
      },

      /**
       * Set payment method (Online or Cash)
       * @param {number} method - PaymentMethod enum
       */
      setPaymentMethod: (method) => {
        console.log('💳 [PaymentStore] Setting payment method:', method);
        set({ selectedPaymentMethod: method });
      },

      /**
       * Set payment type (Card or MobileWallet)
       * @param {number} type - PaymentType enum
       */
      setPaymentType: (type) => {
        console.log('💳 [PaymentStore] Setting payment type:', type);
        set({ selectedPaymentType: type });
      },

      /**
       * Initiate payment
       */
      initiatePayment: async () => {
        const { orderType, orderId, selectedPaymentMethod, selectedPaymentType } = get();

        console.log('💳 [PaymentStore] Initiating payment:', {
          orderType,
          orderId,
          selectedPaymentMethod,
          selectedPaymentType,
        });

        set({ loading: true, error: null });

        try {
          let result;

          // Call appropriate service based on order type
          if (orderType === 'appointment') {
            result = await paymentService.initiateAppointmentPayment(
              orderId,
              selectedPaymentMethod,
              selectedPaymentType
            );
          } else if (orderType === 'pharmacy') {
            result = await paymentService.initiatePharmacyOrderPayment(
              orderId,
              selectedPaymentMethod,
              selectedPaymentType
            );
          } else if (orderType === 'lab') {
            result = await paymentService.initiateLabOrderPayment(
              orderId,
              selectedPaymentMethod,
              selectedPaymentType
            );
          } else {
            throw new Error('Invalid order type');
          }

          console.log('✅ [PaymentStore] Payment initiated successfully:', result);

          const paymentData = result.data;

          set({
            currentPayment: paymentData,
            paymentId: paymentData.paymentId,
            paymentUrl: paymentData.paymentUrl,
            referenceNumber: paymentData.referenceNumber,
            loading: false,
            error: null,
          });

          // If payment requires redirect (Online payment), redirect to Paymob
          if (paymentData.requiresRedirect && paymentData.paymentUrl) {
            console.log('🔗 [PaymentStore] Redirecting to payment URL:', paymentData.paymentUrl);
            window.location.href = paymentData.paymentUrl;
          }

          return { success: true, data: paymentData };
        } catch (error) {
          console.error('❌ [PaymentStore] Payment initiation failed:', error);

          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'فشل في بدء عملية الدفع';

          set({
            loading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      /**
       * Verify payment status
       * @param {string} paymentId - Payment ID
       */
      verifyPayment: async (paymentId) => {
        console.log('🔍 [PaymentStore] Verifying payment:', paymentId);

        set({ loading: true, error: null });

        try {
          const result = await paymentService.getPaymentDetails(paymentId);

          console.log('✅ [PaymentStore] Payment verified:', result);

          set({
            currentPayment: result.data,
            paymentId: result.data.id,
            loading: false,
            error: null,
          });

          return { success: true, data: result.data };
        } catch (error) {
          console.error('❌ [PaymentStore] Payment verification failed:', error);

          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'فشل في التحقق من حالة الدفع';

          set({
            loading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      /**
       * Cancel payment
       * @param {string} paymentId - Payment ID
       */
      cancelPayment: async (paymentId) => {
        console.log('🚫 [PaymentStore] Cancelling payment:', paymentId);

        set({ loading: true, error: null });

        try {
          const result = await paymentService.cancelPayment(paymentId);

          console.log('✅ [PaymentStore] Payment cancelled:', result);

          set({
            currentPayment: result.data,
            loading: false,
            error: null,
          });

          return { success: true, data: result.data };
        } catch (error) {
          console.error('❌ [PaymentStore] Payment cancellation failed:', error);

          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'فشل في إلغاء الدفع';

          set({
            loading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      /**
       * Reset payment state
       */
      resetPayment: () => {
        console.log('🔄 [PaymentStore] Resetting payment state');

        set({
          currentPayment: null,
          paymentId: null,
          paymentUrl: null,
          referenceNumber: null,
          orderType: null,
          orderId: null,
          orderAmount: null,
          selectedPaymentMethod: PaymentMethod.ONLINE,
          selectedPaymentType: PaymentType.CARD,
          loading: false,
          error: null,
          isPaymentModalOpen: false,
        });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'PaymentStore' }
  )
);
