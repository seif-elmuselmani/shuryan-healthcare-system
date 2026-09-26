import { useState, useEffect } from "react";
import { FaFlask, FaSync, FaFilter, FaExclamationCircle } from "react-icons/fa";
import patientService from "../../../api/services/patient.service";
import LabOrderCard from "../components/lab/LabOrderCard";
import PaymentModal from "../components/lab/PaymentModal";

/**
 * Lab Orders Page
 * Displays all lab test orders for the current patient
 * Allows payment for orders in AwaitingPayment status
 */
const LabOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch lab orders on mount
  useEffect(() => {
    fetchLabOrders();
  }, []);

  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔬 Fetching lab orders...');
      
      const data = await patientService.getMyLabOrders();
      console.log('✅ Lab orders fetched:', data);
      
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching lab orders:', err);
      setError(err.response?.data?.message || err.message || 'فشل تحميل طلبات التحاليل');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleViewDetails = (order) => {
    // TODO: Implement order details modal
    console.log('View order details:', order);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    // Refresh orders list
    fetchLabOrders();
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
  };

  // Filter orders based on selected status
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return order.status === 4; // AwaitingPayment
    if (filterStatus === 'active') return [5, 6, 7, 8].includes(order.status); // Paid, AwaitingSamples, InProgress, ResultsReady
    if (filterStatus === 'completed') return order.status === 9; // Completed
    return true;
  });

  // Loading State
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-slate-200 rounded-lg w-64 mb-4 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-96 animate-pulse"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-slate-200 animate-pulse"
              >
                <div className="h-8 bg-slate-200 rounded-lg w-32 mb-4"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border-2 border-red-200 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationCircle className="text-4xl text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">حدث خطأ</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={fetchLabOrders}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
            >
              <FaSync />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-800 mb-2 flex items-center gap-3">
              <FaFlask className="text-cyan-600" />
              طلبات التحاليل
            </h1>
            <p className="text-slate-600">جميع طلبات التحاليل الخاصة بك</p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl p-12 border-2 border-dashed border-slate-300 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFlask className="text-5xl text-cyan-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد طلبات</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              لم تقم بإرسال أي طلبات تحاليل للمعامل حتى الآن. عندما ترسل طلب، سيظهر هنا.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 mb-2 flex items-center gap-3">
              <FaFlask className="text-cyan-600" />
              طلبات التحاليل
            </h1>
            <p className="text-slate-600">
              لديك {filteredOrders.length} طلب
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white text-slate-700 rounded-xl font-bold border-2 border-slate-200 hover:border-cyan-300 transition-all duration-200 appearance-none cursor-pointer pr-10"
              >
                <option value="all">جميع الطلبات</option>
                <option value="pending">في انتظار الدفع</option>
                <option value="active">الطلبات النشطة</option>
                <option value="completed">المكتملة</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchLabOrders}
              disabled={loading}
              className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold border-2 border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <LabOrderCard
                key={order.id}
                order={order}
                onPayClick={handlePayClick}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-300 text-center">
            <p className="text-slate-600">لا توجد طلبات بهذا الفلتر</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default LabOrdersPage;
