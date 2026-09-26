import React, { useState, useEffect } from "react";
import { 
  FaTimes, FaPrescriptionBottleAlt, 
  FaPills, FaClock, FaStickyNote, FaPrint, FaCalendarAlt,
  FaUser, FaFileAlt
} from "react-icons/fa";

/**
 * PrescriptionModal Component - Premium Design
 * Modal for viewing patient prescriptions
 */
const PrescriptionModal = ({ isOpen, onClose, patient }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch prescription data
  useEffect(() => {
    if (isOpen && patient) {
      fetchPrescription();
    }
  }, [isOpen, patient]);

  const fetchPrescription = async () => {
    setLoading(true);
    // Simulate API call - Replace with real API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock prescription data
    setPrescription({
      id: 1,
      date: '2025-10-28',
      medications: [
        {
          id: 1,
          name: 'باراسيتامول 500 مجم',
          dosage: 'قرص واحد',
          frequency: '3 مرات يومياً',
          duration: '7 أيام',
          notes: 'بعد الأكل'
        },
        {
          id: 2,
          name: 'أموكسيسيلين 500 مجم',
          dosage: 'كبسولة واحدة',
          frequency: '3 مرات يومياً',
          duration: '5 أيام',
          notes: 'قبل الأكل بنصف ساعة'
        },
        {
          id: 3,
          name: 'فيتامين سي 1000 مجم',
          dosage: 'قرص واحد',
          frequency: 'مرة واحدة يومياً',
          duration: '30 يوم',
          notes: 'ص'
        }
      ],
      generalNotes: 'الراحة التامة وشرب السوائل بكثرة. المتابعة بعد أسبوع.'
    });
    setLoading(false);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FaPrescriptionBottleAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">عرض الروشتة</h2>
                  <p className="text-white/90 text-sm font-medium">
                    {patient?.fullName || 'مريض'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-white text-lg" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {loading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">جاري تحميل الروشتة...</p>
                </div>
              </div>
            ) : !prescription ? (
              /* No Prescription State */
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileAlt className="text-slate-400 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد روشتة</h3>
                <p className="text-slate-600 font-medium">لم يتم كتابة روشتة لهذا المريض بعد</p>
              </div>
            ) : (
              <>
                {/* Prescription Info - Premium Design */}
                <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 mb-6 shadow-xl overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                        <FaCalendarAlt className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80">تاريخ الروشتة</p>
                        <p className="text-base font-black text-white">{prescription.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                        <FaUser className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80">المريض</p>
                        <p className="text-base font-black text-white">{patient?.fullName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medications List */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <FaPills className="text-teal-600" />
                    الأدوية ({prescription.medications.length})
                  </h3>

                  {prescription.medications.map((med, index) => (
                    <div 
                      key={med.id} 
                      className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border-2 border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      {/* Accent line */}
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600 rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-start gap-4 mb-5">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-lg">{index + 1}</span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">{med.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-slate-500">دواء رقم {index + 1}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Dosage */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-teal-600 mb-2">💊 الجرعة</p>
                          <p className="text-sm font-black text-slate-900">{med.dosage}</p>
                        </div>

                        {/* Frequency */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-teal-600 mb-2 flex items-center gap-1">
                            <FaClock className="text-[10px]" />
                            عدد المرات
                          </p>
                          <p className="text-sm font-black text-slate-900">{med.frequency}</p>
                        </div>

                        {/* Duration */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-teal-600 mb-2">⏱️ المدة</p>
                          <p className="text-sm font-black text-slate-900">{med.duration}</p>
                        </div>

                        {/* Notes */}
                        {med.notes && (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-sm">
                            <p className="text-xs font-bold text-amber-700 mb-2">📝 ملاحظات</p>
                            <p className="text-sm font-black text-slate-900">{med.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* General Notes - Premium */}
                {prescription.generalNotes && (
                  <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-amber-300 shadow-lg overflow-hidden">
                    {/* Decorative corner */}
                    <div className="absolute top-0 left-0 w-20 h-20 bg-amber-200/30 rounded-full blur-2xl"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                          <FaStickyNote className="text-white text-lg" />
                        </div>
                        <h4 className="text-base font-black text-slate-900">ملاحظات عامة وتعليمات</h4>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                          {prescription.generalNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t-2 border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm"
              >
                إغلاق
              </button>
              
              <button
                onClick={handlePrint}
                disabled={!prescription}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPrint />
                طباعة الروشتة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
