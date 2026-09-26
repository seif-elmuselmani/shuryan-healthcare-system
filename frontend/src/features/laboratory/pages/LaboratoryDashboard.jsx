import React, { useState, useEffect } from "react";
import {
  FaFlask,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaMicroscope
} from "react-icons/fa";
import useLabStatsStore from "../stores/labStatsStore";
import useLabOrders from "../hooks/useLabOrders";
import { formatDate } from "../../../utils/helpers";
import { startWork, getOrderDetails } from "../../../api/services/laboratory.service";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { LAB_ORDER_STATUS, LAB_STATUS_CONFIG } from "../constants/labConstants";

/**
 * Laboratory Dashboard - Main Page
 * @component
 */
const LaboratoryDashboard = () => {

  // Use statistics store
  const { statistics, loading: statsLoading, error: statsError, fetchStatistics } = useLabStatsStore();

  // Use orders hook
  const {
    orders,
    loading,
    error,
    getStatusConfig,
    refreshOrders,
    updateOrderStatus: updateOrderStatusLocal,
  } = useLabOrders({ autoFetch: true, pageSize: 5 }); // Show only 5 recent orders on dashboard

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Map API statistics to stats cards
  const stats = statistics ? [
    {
      id: 1,
      title: 'طلبات جديدة اليوم',
      value: statistics.newOrdersToday?.toString() || '0',
      IconComponent: FaFlask,
      bgColor: 'bg-[#00b19f]/10',
      textColor: 'text-[#00b19f]',
    },
    {
      id: 2,
      title: 'طلبات معلقة',
      value: statistics.pendingOrders?.toString() || '0',
      IconComponent: FaClock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      id: 3,
      title: 'طلبات مكتملة',
      value: statistics.completedOrders?.toString() || '0',
      IconComponent: FaCheckCircle,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      id: 4,
      title: 'إيرادات اليوم',
      value: `${statistics.todayRevenue?.toLocaleString() || '0'} ج.م`,
      IconComponent: FaMoneyBillWave,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 5,
      title: 'طلبات الشهر',
      value: statistics.monthlyOrders?.toString() || '0',
      IconComponent: FaCalendarAlt,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      id: 6,
      title: 'إيرادات الشهر',
      value: `${statistics.monthlyRevenue?.toLocaleString() || '0'} ج.م`,
      IconComponent: FaChartLine,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ] : [];

  // Order details modal state
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);


  // Handle start work (status 6 -> 7)
  const handleStartWork = async (orderId) => {
    console.log('▶️ Starting work on order:', orderId);

    // Optimistic update
    const prevOrder = orders.find(o => o.orderId === orderId);
    const prevStatus = prevOrder?.laboratoryOrderStatus;
    updateOrderStatusLocal(orderId, LAB_ORDER_STATUS.IN_PROGRESS_AT_LAB);

    try {
      const result = await startWork(orderId);
      if (result.success) {
        console.log('✅ Work started successfully');
        // Refresh to get latest data
        await refreshOrders();
      } else {
        // Rollback on failure
        updateOrderStatusLocal(orderId, prevStatus);
        console.error('❌ Failed to start work:', result.error);
        alert(result.error || 'فشل في بدء العمل على الطلب');
      }
    } catch (error) {
      // Rollback on error
      updateOrderStatusLocal(orderId, prevStatus);
      console.error('❌ Error starting work:', error);
      alert('حدث خطأ أثناء بدء العمل على الطلب');
    }
  };

  // Handle viewing order details
  const handleViewOrderDetails = async (orderId) => {
    console.log('👁️ View order details:', orderId);
    setIsOrderDetailsModalOpen(true);
    setLoadingOrderDetails(true);
    setSelectedOrderDetails(null);

    try {
      const details = await getOrderDetails(orderId);
      setSelectedOrderDetails(details);
      console.log('📋 Order details:', details);
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      alert('حدث خطأ أثناء جلب تفاصيل الطلب');
      setIsOrderDetailsModalOpen(false);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Handle closing order details modal
  const handleCloseOrderDetailsModal = () => {
    setIsOrderDetailsModalOpen(false);
    setSelectedOrderDetails(null);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black mb-3 leading-tight" style={{
            background: 'linear-gradient(to right, #00b19f, #00d4be)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            إدارة طلبات التحاليل والفحوصات الطبية
          </p>
        </div>

        {/* Stats Grid - 6 Cards in One Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {statsLoading ? (
            /* Loading State for Stats */
            <div className="col-span-full text-center py-8">
              <div className="inline-block w-10 h-10 border-4 border-[#00b19f] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-600 font-medium">جاري تحميل الإحصائيات...</p>
            </div>
          ) : statsError ? (
            /* Error State for Stats */
            <div className="col-span-full text-center py-8">
              <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-2xl text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ في تحميل الإحصائيات</h3>
              <p className="text-slate-500 text-sm mb-3">{statsError}</p>
              <button
                onClick={fetchStatistics}
                className="px-4 py-2 bg-[#00b19f] hover:bg-[#00a08d] text-white font-semibold rounded-lg transition-all duration-200"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            /* Stats Cards */
            stats.map((stat) => {
              const Icon = stat.IconComponent;
              return (
                <div
                  key={stat.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-lg hover:border-[#00b19f]/30 transition-all duration-300 group"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`text-xl ${stat.textColor}`} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-slate-600 text-xs font-semibold mb-2 text-center leading-tight">{stat.title}</h3>

                  {/* Value */}
                  <p className="text-2xl font-black text-slate-800 text-center">{stat.value}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800">أحدث الطلبات</h2>
          </div>

          {/* Orders Table */}
          {loading ? (
            /* Loading State */
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-[#00b19f] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">جاري تحميل الطلبات...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                <FaFlask className="text-4xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-3">حدث خطأ</h3>
              <p className="text-slate-500 text-base mb-4">{error}</p>
              <button
                onClick={refreshOrders}
                className="px-6 py-2 bg-[#00b19f] hover:bg-[#00a08d] text-white font-semibold rounded-lg transition-all duration-200"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">رقم الطلب</th>
                    <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">المريض</th>
                    <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">المعمل</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-700">الحالة</th>
                    <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">التاريخ</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);

                    return (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-sm font-semibold text-slate-800">#{order.id?.substring(0, 8)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{order.patientName || 'غير محدد'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-slate-700">{order.laboratoryName || 'غير محدد'}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-slate-600">{formatDate(order.createdAt, 'DD/MM/YYYY HH:mm')}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Start Work Button - Only show for status 6 (AWAITING_SAMPLES) */}
                            {order.status === LAB_ORDER_STATUS.AWAITING_SAMPLES && (
                              <button
                                onClick={() => handleStartWork(order.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <FaMicroscope className="text-base" />
                                <span>بدء العمل</span>
                              </button>
                            )}
                            
                            {/* View Details Button */}
                            <button
                              onClick={() => handleViewOrderDetails(order.id)}
                              disabled={loadingOrderDetails}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00b19f] hover:bg-[#00a08d] text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingOrderDetails ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>جاري التحميل...</span>
                                </>
                              ) : (
                                <>
                                  <FaMicroscope className="text-base" />
                                  <span>عرض التفاصيل</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm" style={{
                background: 'linear-gradient(to bottom right, rgba(0, 177, 159, 0.1), rgba(0, 212, 190, 0.1))'
              }}>
                <FaFlask className="text-4xl" style={{ color: '#00b19f' }} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-3">لا توجد طلبات حالياً</h3>
              <p className="text-slate-500 text-base">سيتم عرض الطلبات الجديدة هنا</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={handleCloseOrderDetailsModal}
        orderDetails={selectedOrderDetails}
        loading={loadingOrderDetails}
      />
    </div>
  );
};

export default LaboratoryDashboard;
