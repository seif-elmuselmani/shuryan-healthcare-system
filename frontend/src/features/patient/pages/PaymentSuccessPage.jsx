import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaHome, FaCalendarCheck } from "react-icons/fa";
import { usePaymentStore } from "../stores/paymentStore";
import { getPaymentStatusName } from "@/api/services/payment.service";

/**
 * PaymentSuccessPage - Callback page after successful payment
 */
const PaymentSuccessPage = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <FaSpinner className="text-6xl text-teal-500 animate-spin mx-auto mb-6" />
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
            <FaCheckCircle className="text-5xl text-red-600" />
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

  const isSuccess = currentPayment.status === 2; // 2 = Completed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
        {/* Success Animation */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 animate-ping">
            <div className="w-24 h-24 rounded-full bg-green-400 opacity-20"></div>
          </div>
          <div className="absolute inset-0 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-green-300 opacity-30"></div>
          </div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
            <FaCheckCircle className="text-white text-5xl" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-4">
          تم الدفع بنجاح! 🎉
        </h2>
        <p className="text-slate-600 text-lg mb-8">
          تمت عملية الدفع بنجاح. شكراً لاستخدامك شريان.
        </p>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-8 text-right">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">رقم العملية</span>
              <span className="font-bold text-slate-800" dir="ltr">
                #{currentPayment.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">المبلغ المدفوع</span>
              <span className="font-bold text-teal-600">
                {currentPayment.amount} جنيه
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">الحالة</span>
              <span className="font-bold text-green-600">
                {getPaymentStatusName(currentPayment.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {currentPayment.orderType === 'ConsultationBooking' && (
            <button
              onClick={() => navigate('/patient/appointments')}
              className="
                w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500
                text-white font-bold hover:shadow-2xl hover:scale-105
                transition-all duration-200
                flex items-center justify-center gap-3
              "
            >
              <FaCalendarCheck className="text-xl" />
              <span>عرض مواعيدي</span>
            </button>
          )}
          
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

export default PaymentSuccessPage;
