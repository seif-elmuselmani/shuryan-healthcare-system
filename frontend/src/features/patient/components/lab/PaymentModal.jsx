import { useState } from "react";
import { FaTimes, FaCreditCard, FaMobileAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFlask } from "react-icons/fa";
import { initiateLabOrderPayment, simulateLabOrderPaymentSuccess, PaymentMethod, PaymentType } from "../../../../api/services/payment.service";

/**
 * Payment Modal Component for Lab Orders
 * Integrates with Paymob payment gateway
 */
const PaymentModal = ({ order, onClose, onPaymentSuccess }) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState(PaymentType.CARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = order.testsTotalCost + order.sampleCollectionDeliveryCost;

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💳 Initiating payment for lab order:', order.id);

      // Initiate payment with Paymob
      const response = await initiateLabOrderPayment(
        order.id,
        PaymentMethod.ONLINE,
        selectedPaymentType
      );

      console.log('✅ Payment initiated:', response);

      if (response.success && response.data?.paymentUrl) {
        // Redirect to Paymob payment page
        console.log('🔗 Redirecting to payment URL:', response.data.paymentUrl);
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('فشل في إنشاء رابط الدفع');
      }
    } catch (err) {
      console.error('❌ Payment initiation error:', err);
      setError(err.response?.data?.message || err.message || 'حدث خطأ أثناء بدء عملية الدفع');
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🧪 Simulating payment success for lab order:', order.id);

      const response = await simulateLabOrderPaymentSuccess(order.id);

      console.log('✅ Payment simulation successful:', response);

      if (response.success) {
        // Close modal and refresh
        alert('تم محاكاة الدفع بنجاح! ✅');
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('❌ Payment simulation error:', err);
      setError(err.response?.data?.message || err.message || 'فشل في محاكاة الدفع');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            disabled={loading}
          >
            <FaTimes />
          </button>

          <h2 className="text-2xl font-black mb-2">دفع وتأكيد الطلب</h2>
          <p className="text-white/90">اختر طريقة الدفع لإتمام طلب التحاليل</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mb-6 border-2 border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-4">ملخص الطلب</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">تكلفة التحاليل:</span>
                <span className="text-lg font-bold text-slate-800">
                  {order.testsTotalCost.toFixed(2)} جنيه
                </span>
              </div>

              {order.sampleCollectionDeliveryCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">رسوم سحب العينة:</span>
                  <span className="text-lg font-bold text-slate-800">
                    {order.sampleCollectionDeliveryCost.toFixed(2)} جنيه
                  </span>
                </div>
              )}

              <div className="border-t-2 border-slate-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-slate-800">الإجمالي:</span>
                  <span className="text-2xl font-black text-cyan-600">
                    {totalAmount.toFixed(2)} جنيه
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800 mb-4">اختر طريقة الدفع</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Payment */}
              <button
                onClick={() => setSelectedPaymentType(PaymentType.CARD)}
                disabled={loading}
                className={`p-5 rounded-2xl border-3 transition-all duration-200 ${
                  selectedPaymentType === PaymentType.CARD
                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedPaymentType === PaymentType.CARD
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <FaCreditCard className="text-2xl" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-black text-slate-800 mb-1">بطاقة ائتمان</h4>
                    <p className="text-sm text-slate-600">فيزا أو ماستركارد</p>
                  </div>
                  {selectedPaymentType === PaymentType.CARD && (
                    <FaCheckCircle className="text-cyan-500 text-xl" />
                  )}
                </div>
              </button>

              {/* Mobile Wallet Payment */}
              <button
                onClick={() => setSelectedPaymentType(PaymentType.MOBILE_WALLET)}
                disabled={loading}
                className={`p-5 rounded-2xl border-3 transition-all duration-200 ${
                  selectedPaymentType === PaymentType.MOBILE_WALLET
                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedPaymentType === PaymentType.MOBILE_WALLET
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <FaMobileAlt className="text-2xl" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-black text-slate-800 mb-1">محفظة موبايل</h4>
                    <p className="text-sm text-slate-600">فودافون كاش</p>
                  </div>
                  {selectedPaymentType === PaymentType.MOBILE_WALLET && (
                    <FaCheckCircle className="text-cyan-500 text-xl" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-blue-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 mb-1">دفع آمن ومضمون</h4>
                <p className="text-sm text-blue-700">
                  جميع المعاملات محمية بأحدث تقنيات التشفير عبر بوابة Paymob الآمنة
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <FaCreditCard />
                  <span>متابعة للدفع</span>
                </>
              )}
            </button>

            <button
              onClick={handleSimulatePayment}
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="محاكاة دفع ناجح (للاختبار فقط)"
            >
              <FaFlask />
              <span>اختبار</span>
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-4 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
