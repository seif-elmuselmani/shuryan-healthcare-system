import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle, FaSpinner, FaHome, FaRedo } from "react-icons/fa";
import { usePaymentStore } from "../stores/paymentStore";
import { getPaymentStatusName } from "@/api/services/payment.service";

/**
 * PaymentFailedPage - Callback page after failed payment
 */
const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  
  const { verifyPayment, currentPayment, loading, error } = usePaymentStore();
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (!paymentId) {
        console.error('❌ No payment_id in URL');
        return;
      }

      console.log('🔍 Verifying payment:', paymentId);
      const result = await verifyPayment(paymentId);

      if (result.success) {
        console.log('✅ Payment verified:', result.data);
        setVerificationComplete(true);
      }
    };

    verifyPaymentStatus();
  }, [paymentId, verifyPayment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <FaSpinner className="text-6xl text-red-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            جاري التحقق من الدفع...
          </h2>
          <p className="text-slate-600">
            يرجى الانتظار قليلاً
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-5xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            فشل التحقق من الدفع
          </h2>
          <p className="text-slate-600 mb-8">
            {error}
          </p>
          <button
            onClick={() => navigate('/patient/search')}
            className="
              w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500
              text-white font-bold hover:shadow-2xl hover:scale-105
              transition-all duration-200
              flex items-center justify-center gap-3
            "
          >
            <FaHome className="text-xl" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    );
  }

  if (!verificationComplete || !currentPayment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
        {/* Failed Animation */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <FaTimesCircle className="text-white text-5xl" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-4">
          فشلت عملية الدفع
        </h2>
        <p className="text-slate-600 text-lg mb-8">
          لم تتم عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.
        </p>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-8 text-right border-2 border-red-200">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">رقم العملية</span>
              <span className="font-bold text-slate-800" dir="ltr">
                #{currentPayment.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">المبلغ</span>
              <span className="font-bold text-slate-800">
                {currentPayment.amount} جنيه
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">الحالة</span>
              <span className="font-bold text-red-600">
                {getPaymentStatusName(currentPayment.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Possible Reasons */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8 text-right">
          <p className="text-sm text-blue-800 font-bold mb-2">
            أسباب محتملة لفشل الدفع:
          </p>
          <ul className="text-xs text-blue-700 space-y-1 mr-4 list-disc">
            <li>رصيد غير كافٍ في البطاقة</li>
            <li>بيانات البطاقة غير صحيحة</li>
            <li>انتهاء صلاحية البطاقة</li>
            <li>مشكلة في الاتصال بالإنترنت</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="
              w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500
              text-white font-bold hover:shadow-2xl hover:scale-105
              transition-all duration-200
              flex items-center justify-center gap-3
            "
          >
            <FaRedo className="text-xl" />
            <span>إعادة المحاولة</span>
          </button>
          
          <button
            onClick={() => navigate('/patient/search')}
            className="
              w-full py-4 rounded-xl border-2 border-slate-300
              text-slate-700 font-bold hover:bg-slate-50
              transition-all duration-200
              flex items-center justify-center gap-3
            "
          >
            <FaHome className="text-xl" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
