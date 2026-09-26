import React, { useState, useEffect } from "react";
import {
  FaTimes, FaEye, FaShoppingCart, FaPhoneAlt, FaMapMarkerAlt,
  FaHashtag, FaClock, FaTimesCircle, FaFileAlt, FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import patientService from "@/api/services/patient.service";
import PharmacyPaymentModal from "./PharmacyPaymentModal";

/**
 * PharmacyReportsModal Component
 * Display pharmacy reports for a prescription order
 */
const PharmacyReportsModal = ({ isOpen, onClose, prescription, onNewOrder }) => {
  const [reports, setReports] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportDetailsOpen, setIsReportDetailsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);

  // Fetch pharmacy reports when modal opens
  useEffect(() => {
    const fetchPharmacyReports = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('📋 Fetching pharmacy reports for prescription:', prescription.id);
        console.log('📋 Full prescription object:', prescription);

        const response = await patientService.getPharmacyReports(prescription.id);

        console.log('✅ Raw API response:', response);
        console.log('✅ Response structure check:', {
          hasData: !!response,
          hasPrescriptionId: !!response?.prescriptionId,
          hasPharmacyResponses: !!response?.pharmacyResponses,
          pharmacyResponsesLength: response?.pharmacyResponses?.length || 0,
          responseKeys: response ? Object.keys(response) : []
        });

        if (response && response.prescriptionId) {
          console.log('✅ Valid prescription pharmacy response found');

          // Log the actual structure of pharmacyResponses
          console.log('🔍 Raw pharmacyResponses:', response.pharmacyResponses);
          if (response.pharmacyResponses && response.pharmacyResponses.length > 0) {
            console.log('🔍 First pharmacy response structure:', response.pharmacyResponses[0]);
            console.log('🔍 Available medications in first response:', response.pharmacyResponses[0]?.availableMedications);
            console.log('🔍 Alternative medications in first response:', response.pharmacyResponses[0]?.alternativeMedications);
          }

          // Convert API response to our expected format
          const convertedReports = response.pharmacyResponses?.map((pharmacyResponse, index) => {
            console.log(`🔍 Processing pharmacy response ${index + 1}:`, pharmacyResponse);
            console.log(`🔍 All keys in pharmacy response ${index + 1}:`, Object.keys(pharmacyResponse));

            // Try different possible field names for medications
            const possibleMedicationFields = [
              'availableMedications', 'medications', 'medicationResponses',
              'items', 'drugs', 'prescriptionItems', 'responseItems'
            ];

            let availableMeds = [];
            let alternativeMeds = [];
            let unavailableMeds = [];

            // Check each possible field
            possibleMedicationFields.forEach(field => {
              if (pharmacyResponse[field]) {
                console.log(`🔍 Found ${field}:`, pharmacyResponse[field]);

                if (Array.isArray(pharmacyResponse[field])) {
                  // If it's an array, try to categorize by status
                  pharmacyResponse[field].forEach(med => {
                    console.log(`🔍 Medication item:`, med);

                    if (med.status === 'available' || med.isAvailable === true || med.available === true) {
                      availableMeds.push(med);
                    } else if (med.status === 'alternative' || med.isAlternative === true || med.alternative === true) {
                      alternativeMeds.push(med);
                    } else if (med.status === 'unavailable' || med.isAvailable === false || med.available === false) {
                      unavailableMeds.push(med);
                    } else {
                      // If no clear status, assume available if it has a price
                      if (med.price || med.totalPrice || med.amount) {
                        availableMeds.push(med);
                      } else {
                        unavailableMeds.push(med);
                      }
                    }
                  });
                }
              }
            });

            // Fallback: use direct fields if they exist
            if (pharmacyResponse.availableMedications && Array.isArray(pharmacyResponse.availableMedications)) {
              availableMeds = pharmacyResponse.availableMedications;
            }
            if (pharmacyResponse.alternativeMedications && Array.isArray(pharmacyResponse.alternativeMedications)) {
              alternativeMeds = pharmacyResponse.alternativeMedications;
            }
            if (pharmacyResponse.unavailableMedications && Array.isArray(pharmacyResponse.unavailableMedications)) {
              unavailableMeds = pharmacyResponse.unavailableMedications;
            }

            console.log(`🔍 Final medication counts for pharmacy ${index + 1}:`, {
              available: availableMeds.length,
              alternative: alternativeMeds.length,
              unavailable: unavailableMeds.length
            });

            return {
              orderId: pharmacyResponse.orderId,
              pharmacyId: pharmacyResponse.pharmacyId,
              pharmacyName: pharmacyResponse.pharmacyName,
              pharmacyPhone: pharmacyResponse.pharmacyPhone,
              pharmacyAddress: pharmacyResponse.pharmacyAddress,
              totalAmount: pharmacyResponse.totalAmount,
              deliveryFee: pharmacyResponse.deliveryFee,
              availableMedications: availableMeds,
              alternativeMedications: alternativeMeds,
              unavailableMedications: unavailableMeds,
              pharmacyNotes: pharmacyResponse.pharmacyNotes,
              sentAt: pharmacyResponse.sentAt,
              respondedAt: pharmacyResponse.respondedAt,
              status: pharmacyResponse.status || 'responded'
            };
          }) || [];

          console.log('📋 Converted reports array:', convertedReports);
          console.log('📋 First report medications check:', {
            available: convertedReports[0]?.availableMedications?.length || 0,
            alternative: convertedReports[0]?.alternativeMedications?.length || 0,
            unavailable: convertedReports[0]?.unavailableMedications?.length || 0
          });

          setReports(convertedReports);
          setPrescriptionData({
            prescriptionId: response.prescriptionId,
            prescriptionNumber: response.prescriptionNumber,
            totalPharmacyResponses: response.totalPharmacyResponses
          });
        } else {
          console.log('⚠️ No valid pharmacy response data found');
          setError('لا توجد تقارير متاحة لهذه الروشتة');
        }

      } catch (err) {
        console.error('❌ Error fetching pharmacy reports:', err);
        setError('حدث خطأ في تحميل تقارير الصيدليات');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && prescription?.id) {
      fetchPharmacyReports();
    }
  }, [isOpen, prescription?.id]);

  const handleViewReport = (report) => {
    console.log('📋 Viewing detailed report for pharmacy:', report.pharmacyName);

    // Use the report data directly since it already contains all the details from the API
    setSelectedReport(report);
    setIsReportDetailsOpen(true);
  };

  const handleOrderNow = (report) => {
    console.log('🛒 Opening payment modal for pharmacy:', report.pharmacyName);
    setOrderToConfirm(report);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      console.log('💳 Payment confirmed:', paymentData);

      // Here you would call the API to confirm the order
      // await patientService.confirmPharmacyOrder(orderToConfirm.orderId, paymentData);

      // Close modals and show success
      setIsPaymentModalOpen(false);
      setOrderToConfirm(null);

      alert(`تم تأكيد الطلب من ${orderToConfirm.pharmacyName} بنجاح! سيتم التواصل معك قريباً.`);

      // Optionally close the reports modal
      onClose();

    } catch (error) {
      console.error('❌ Order confirmation failed:', error);
      alert('حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileAlt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">تقارير الصيدليات</h2>
                  <p className="text-teal-100 font-medium">
                    روشتة رقم: {prescriptionData?.prescriptionNumber || prescription?.prescriptionNumber || 'غير محدد'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // Close this modal first
                    onClose();
                    // Call the onNewOrder callback if provided
                    if (onNewOrder) {
                      onNewOrder(prescription);
                    } else {
                      // Fallback: navigate to prescriptions page
                      window.location.href = '/patient/prescriptions';
                    }
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl flex items-center gap-2 transition-colors font-bold text-sm"
                >
                  <FaShoppingCart className="w-4 h-4" />
                  <span>طلب جديد</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {loading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">جاري تحميل التقارير...</p>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-red-500 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">حدث خطأ</h3>
                <p className="text-slate-600 font-medium mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all font-bold text-sm shadow-lg"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : reports.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileAlt className="text-slate-400 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد تقارير</h3>
                <p className="text-slate-600 font-medium">لم ترد أي صيدلية على هذه الروشتة بعد</p>
              </div>
            ) : (
              /* Reports Grid */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report, index) => (
                  <div
                    key={report.orderId || index}
                    className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-lg p-6"
                  >
                    {/* Pharmacy Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800">{report.pharmacyName}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FaMapMarkerAlt className="text-teal-500" />
                            <span>{report.pharmacyAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-600">إجمالي السعر</p>
                          <p className="text-2xl font-black text-slate-800">{report.totalAmount} ج.م</p>
                        </div>
                        {report.deliveryFee > 0 && (
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-600">رسوم التوصيل</p>
                            <p className="text-lg font-bold text-emerald-600">{report.deliveryFee} ج.م</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medications Summary */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">الأدوية المتوفرة:</span>
                        <span className="font-bold text-green-600">{report.availableMedications?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">البدائل المقترحة:</span>
                        <span className="font-bold text-blue-600">{report.alternativeMedications?.length || 0}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaEye className="w-4 h-4" />
                        عرض التفاصيل
                      </button>
                      <button
                        onClick={() => handleOrderNow(report)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        اطلب الآن
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {isReportDetailsOpen && selectedReport && (
        <ReportDetailsModal
          isOpen={isReportDetailsOpen}
          onClose={() => setIsReportDetailsOpen(false)}
          report={selectedReport}
          onOrderNow={() => {
            setIsReportDetailsOpen(false);
            handleOrderNow(selectedReport);
          }}
        />
      )}

      {/* Payment Modal */}
      <PharmacyPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={orderToConfirm}
        onPaymentConfirm={handlePaymentConfirm}
      />
    </>
  );
};

/**
 * ReportDetailsModal Component
 * Display detailed pharmacy report with medications
 */
const ReportDetailsModal = ({ isOpen, onClose, report, onOrderNow }) => {
  if (!isOpen || !report) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaFileAlt className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black">{report.pharmacyName}</h2>
                <p className="text-emerald-100 font-medium">تفاصيل العرض والأدوية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Pharmacy Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-black text-slate-800 mb-3">معلومات الصيدلية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-teal-500" />
                <span className="text-sm font-semibold text-slate-700">{report.pharmacyAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-teal-500" />
                <span className="text-sm font-semibold text-slate-700">{report.pharmacyPhone}</span>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-black text-slate-800 mb-3">تفاصيل السعر</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">إجمالي الأدوية</p>
                <p className="text-2xl font-black text-slate-800">{report.totalAmount} ج.م</p>
              </div>
              {report.deliveryFee > 0 && (
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-600">رسوم التوصيل</p>
                  <p className="text-xl font-bold text-emerald-600">{report.deliveryFee} ج.م</p>
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-600">المجموع الكلي</p>
                <p className="text-2xl font-black text-emerald-600">
                  {(report.totalAmount + (report.deliveryFee || 0))} ج.م
                </p>
              </div>
            </div>
          </div>

          {/* Available Medications */}
          {report.availableMedications && report.availableMedications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                الأدوية المتوفرة ({report.availableMedications.length})
              </h3>
              <div className="space-y-3">
                {report.availableMedications.map((med, index) => (
                  <div key={index} className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {med.medicationName || med.name || med.drugName || med.itemName || 'دواء غير محدد'}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {(med.dosage || med.dose || med.strength || '')}
                          {(med.dosage || med.dose || med.strength) && (med.form || med.type || med.unit) && ' • '}
                          {(med.form || med.type || med.unit || '')}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black text-green-600">
                          {med.price || med.totalPrice || med.amount || med.cost || 0} ج.م
                        </p>
                        <p className="text-sm text-slate-600">
                          الكمية: {med.quantity || med.qty || med.count || med.amount || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Medications */}
          {report.alternativeMedications && report.alternativeMedications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-blue-500" />
                البدائل المقترحة ({report.alternativeMedications.length})
              </h3>
              <div className="space-y-3">
                {report.alternativeMedications.map((med, index) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {med.medicationName || med.name || med.drugName || med.itemName || 'دواء غير محدد'}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {(med.dosage || med.dose || med.strength || '')}
                          {(med.dosage || med.dose || med.strength) && (med.form || med.type || med.unit) && ' • '}
                          {(med.form || med.type || med.unit || '')}
                        </p>
                        <p className="text-xs text-blue-600 font-semibold">
                          بديل لـ: {med.originalMedication || med.originalName || med.replacesName || 'دواء أصلي'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black text-blue-600">
                          {med.price || med.totalPrice || med.amount || med.cost || 0} ج.م
                        </p>
                        <p className="text-sm text-slate-600">
                          الكمية: {med.quantity || med.qty || med.count || med.amount || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Medications */}
          {report.unavailableMedications && report.unavailableMedications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <FaTimesCircle className="text-red-500" />
                الأدوية غير المتوفرة ({report.unavailableMedications.length})
              </h3>
              <div className="space-y-3">
                {report.unavailableMedications.map((med, index) => (
                  <div key={index} className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {med.medicationName || med.name || med.drugName || med.itemName || 'دواء غير محدد'}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {(med.dosage || med.dose || med.strength || '')}
                          {(med.dosage || med.dose || med.strength) && (med.form || med.type || med.unit) && ' • '}
                          {(med.form || med.type || med.unit || '')}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          غير متوفر
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pharmacy Notes */}
          {report.pharmacyNotes && (
            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-black text-slate-800 mb-2">ملاحظات الصيدلية</h3>
              <p className="text-slate-700">{report.pharmacyNotes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">تاريخ الإرسال: </span>
                {formatDate(report.sentAt)}
              </div>
              <div>
                <span className="font-semibold">تاريخ الرد: </span>
                {formatDate(report.respondedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-colors font-bold"
            >
              إغلاق
            </button>
            <button
              onClick={() => onOrderNow(report)}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all font-bold flex items-center gap-2"
            >
              <FaShoppingCart className="w-5 h-5" />
              تأكيد الطلب الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyReportsModal;
