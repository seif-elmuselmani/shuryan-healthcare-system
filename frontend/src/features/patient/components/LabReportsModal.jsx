import React, { useState, useEffect } from "react";
import {
  FaTimes, FaEye, FaShoppingCart, FaPhoneAlt, FaMapMarkerAlt,
  FaHashtag, FaClock, FaTimesCircle, FaFileAlt, FaCheckCircle,
  FaExclamationTriangle, FaFlask
} from "react-icons/fa";
import patientService from "@/api/services/patient.service";

/**
 * LabReportsModal Component
 * Display laboratory reports for a lab result order
 */
const LabReportsModal = ({ isOpen, onClose, labResult, onNewOrder }) => {
  const [reports, setReports] = useState([]);
  const [labResultData, setLabResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportDetailsOpen, setIsReportDetailsOpen] = useState(false);

  // Fetch laboratory reports when modal opens
  useEffect(() => {
    const fetchLaboratoryReports = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('📋 Fetching laboratory reports for lab result:', labResult.id);
        const response = await patientService.getLabResultLaboratoryResponses(labResult.id);

        if (response && response.labResultId) {
          console.log('✅ Valid lab result laboratory response found');

          const convertedReports = response.laboratoryResponses?.map((labResponse) => ({
            orderId: labResponse.orderId,
            laboratoryId: labResponse.laboratoryId,
            laboratoryName: labResponse.laboratoryName,
            laboratoryPhone: labResponse.laboratoryPhone,
            laboratoryAddress: labResponse.laboratoryAddress,
            totalAmount: labResponse.totalAmount,
            homeSampleCollectionFee: labResponse.homeSampleCollectionFee,
            offersHomeSampleCollection: labResponse.offersHomeSampleCollection,
            availableTests: labResponse.availableTests || [],
            unavailableTests: labResponse.unavailableTests || [],
            laboratoryNotes: labResponse.laboratoryNotes,
            sentAt: labResponse.sentAt,
            respondedAt: labResponse.respondedAt,
            status: labResponse.status || 'responded'
          })) || [];

          setReports(convertedReports);
          setLabResultData({
            labResultId: response.labResultId,
            labResultNumber: response.labResultNumber,
            totalLaboratoryResponses: response.totalLaboratoryResponses
          });
        } else {
          setError('لا توجد تقارير متاحة لهذا التحليل');
        }
      } catch (err) {
        console.error('❌ Error fetching laboratory reports:', err);
        setError('حدث خطأ في تحميل تقارير المعامل');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && labResult?.id) {
      fetchLaboratoryReports();
    }
  }, [isOpen, labResult?.id]);

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsReportDetailsOpen(true);
  };

  const handleOrderNow = async (report) => {
    try {
      await patientService.confirmLaboratoryOrder(report.orderId);
      alert(`تم تأكيد الطلب من ${report.laboratoryName} بنجاح! سيتم التواصل معك قريباً.`);
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
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFlask className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">تقارير المعامل</h2>
                  <p className="text-cyan-100 font-medium">
                    تحليل رقم: {labResultData?.labResultNumber || labResult?.labResultNumber || 'غير محدد'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onNewOrder) {
                      onNewOrder(labResult);
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

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
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
                <p className="text-slate-600 font-medium">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileAlt className="text-slate-400 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد تقارير</h3>
                <p className="text-slate-600 font-medium">لم يتم استلام أي تقارير من المعامل بعد</p>
              </div>
            ) : (
              /* Reports List */
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-slate-800 mb-2">التقارير الواردة</h3>
                  <p className="text-slate-600 font-semibold">
                    تم استلام {reports.length} تقرير من المعامل
                  </p>
                </div>

                {reports.map((report) => (
                  <div
                    key={report.orderId}
                    className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-cyan-300 hover:shadow-lg transition-all"
                  >
                    {/* Laboratory Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaFlask className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-lg">{report.laboratoryName}</h4>
                          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                            <FaMapMarkerAlt className="text-cyan-600" />
                            <span className="font-semibold">{report.laboratoryAddress}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                            <FaPhoneAlt className="text-cyan-600" />
                            <span className="font-semibold">{report.laboratoryPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Report Summary */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">إجمالي المبلغ:</span>
                        <span className="font-black text-cyan-600 text-lg">{report.totalAmount} جنيه</span>
                      </div>
                      
                      {report.offersHomeSampleCollection && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-semibold">أخذ العينات من المنزل:</span>
                          <span className="font-semibold text-green-600">
                            متاح ({report.homeSampleCollectionFee} جنيه)
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">التحاليل المتاحة:</span>
                        <span className="font-semibold text-green-600">{report.availableTests?.length || 0}</span>
                      </div>

                      {report.unavailableTests?.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-semibold">التحاليل غير المتاحة:</span>
                          <span className="font-semibold text-red-600">{report.unavailableTests.length}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">وقت الرد:</span>
                        <span className="text-slate-500 text-sm">{formatDate(report.respondedAt)}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {report.laboratoryNotes && (
                      <div className="bg-cyan-50 rounded-lg p-3 mb-4 border border-cyan-200">
                        <p className="text-xs font-semibold text-cyan-700 mb-1">ملاحظات المعمل:</p>
                        <p className="text-sm font-medium text-slate-700">{report.laboratoryNotes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <FaEye className="text-sm" />
                        <span>عرض التفاصيل</span>
                      </button>
                      <button
                        onClick={() => handleOrderNow(report)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle className="text-sm" />
                        <span>اطلب الآن</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">تفاصيل التقرير</h3>
                <button
                  onClick={() => setIsReportDetailsOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <h4 className="text-lg font-black text-slate-800 mb-4">{selectedReport.laboratoryName}</h4>

              {/* Available Tests */}
              {selectedReport.availableTests?.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-md font-bold text-green-600 mb-3 flex items-center gap-2">
                    <FaCheckCircle />
                    التحاليل المتاحة ({selectedReport.availableTests.length})
                  </h5>
                  <div className="space-y-2">
                    {selectedReport.availableTests.map((test, index) => (
                      <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800">{test.testName}</p>
                            {test.testCode && <p className="text-xs text-slate-500">كود: {test.testCode}</p>}
                          </div>
                          <span className="font-black text-green-600">{test.price} جنيه</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable Tests */}
              {selectedReport.unavailableTests?.length > 0 && (
                <div>
                  <h5 className="text-md font-bold text-red-600 mb-3 flex items-center gap-2">
                    <FaTimesCircle />
                    التحاليل غير المتاحة ({selectedReport.unavailableTests.length})
                  </h5>
                  <div className="space-y-2">
                    {selectedReport.unavailableTests.map((test, index) => (
                      <div key={index} className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="font-bold text-slate-800">{test.testName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabReportsModal;
