import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaPlay, FaFilter, FaClock, FaChevronDown, FaCheck, FaSpinner, FaArrowRight } from "react-icons/fa";

/**
 * Today's Appointments Component
 * Simple, elegant design with brand colors
 * @component
 */
const TodayAppointments = ({ 
  appointments, 
  filterType = 'all', 
  onStartAppointment, 
  onFilterChange, 
  loading = false, 
  sessionLoading = null
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  /**
   * Get filter label in Arabic
   */
  const getFilterLabel = () => {
    const labels = {
      'all': 'جميع الأنواع',
      'كشف عام': 'كشف عام',
      'متابعة': 'متابعة',
    };
    return labels[filterType] || 'جميع الأنواع';
  };
  /**
   * Get status badge styling - Simple & Clean
   */
  const getStatusBadge = (status) => {
    const badges = {
      'كشف عام': {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
      },
      'متابعة': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
      },
    };

    return badges[status] || badges['كشف عام'];
  };

  /**
   * Patient avatar gradient style - Fixed gradient for all
   */
  const getPatientAvatarStyle = () => ({
    background: 'linear-gradient(135deg, #1ebdb2 0%, #19978e 100%)',
  });

  return (
    <section className="mb-8" aria-labelledby="appointments-heading">
      {/* Header - Gradient Background with Grid Pattern */}
      <div 
        className="rounded-t-2xl p-6 shadow-md relative"
        style={{
          backgroundColor: '#0d9488',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="appointments-heading" className="text-2xl font-bold text-white mb-1">
                مواعيد اليوم
              </h2>
              <p className="text-white/80 text-sm">
                {new Date().toLocaleDateString('ar-EG', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Total Count Badge */}
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <span className="text-white font-bold text-lg">{appointments?.length || 0}</span>
              <span className="text-white/90 text-sm mr-2">موعد</span>
            </div>

            {/* Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2"
              >
                <FaFilter className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{getFilterLabel()}</span>
                <FaChevronDown className={`w-3 h-3 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="py-1">
                    {/* All Types */}
                    <button
                      onClick={() => {
                        onFilterChange('all');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        filterType === 'all'
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>جميع الأنواع</span>
                      {filterType === 'all' && <FaCheck className="w-4 h-4 text-teal-600" />}
                    </button>

                    {/* Regular Checkup */}
                    <button
                      onClick={() => {
                        onFilterChange('كشف عام');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        filterType === 'كشف عام'
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>كشف عام</span>
                      {filterType === 'كشف عام' && <FaCheck className="w-4 h-4 text-teal-600" />}
                    </button>

                    {/* Follow-up */}
                    <button
                      onClick={() => {
                        onFilterChange('متابعة');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        filterType === 'متابعة'
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>متابعة</span>
                      {filterType === 'متابعة' && <FaCheck className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List - Enhanced Design */}
      <div className="bg-white rounded-b-2xl shadow-md border border-slate-200">
        <div className="divide-y divide-slate-100">
          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">جاري تحميل المواعيد...</p>
            </div>
          ) : appointments?.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FaCalendarAlt className="w-12 h-12 text-teal-500" />
              </div>
              <p className="text-slate-500 text-lg font-medium">لا توجد مواعيد اليوم</p>
            </div>
          ) : (
            appointments?.map((appointment) => {
              const isInProgress = appointment.apiStatus === 'InProgress' || appointment.apiStatus === 3;
              
              return (
              <article
                key={appointment.id}
                className={`p-5 transition-all duration-200 ${
                  isInProgress 
                    ? 'bg-amber-50/50 border-r-4 border-amber-500 hover:bg-amber-50' 
                    : 'hover:bg-teal-50/30'
                }`}
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Patient Avatar - Fixed Gradient */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                      style={getPatientAvatarStyle()}
                    >
                      <span className="text-white font-bold text-lg">
                        {appointment.patientInitial}
                      </span>
                    </div>

                    {/* Patient Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-slate-800 font-bold text-lg truncate">
                          {appointment.patientName}
                        </h3>
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            getStatusBadge(appointment.status).bg
                          } ${getStatusBadge(appointment.status).text}`}
                        >
                          {appointment.status}
                        </span>
                        {isInProgress && (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            🔴 جلسة نشطة
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        {/* Time */}
                        <div className="flex items-center gap-2 text-slate-600">
                          <FaClock className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold">{appointment.time}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="text-slate-300">•</span>
                          <span className="font-medium">{appointment.duration} دقيقة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button - Dynamic based on status */}
                  <button
                    onClick={() => onStartAppointment?.(appointment)}
                    disabled={sessionLoading === appointment.id}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md ${
                      sessionLoading === appointment.id
                        ? 'bg-slate-400 cursor-not-allowed'
                        : (appointment.apiStatus === 'InProgress' || appointment.apiStatus === 3)
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-teal-600 hover:bg-teal-700'
                    } text-white`}
                  >
                    {sessionLoading === appointment.id ? (
                      <>
                        <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري التحميل...</span>
                      </>
                    ) : (appointment.apiStatus === 'InProgress' || appointment.apiStatus === 3) ? (
                      <>
                        <FaArrowRight className="w-3.5 h-3.5" />
                        <span>متابعة الكشف</span>
                      </>
                    ) : (
                      <>
                        <FaPlay className="w-3.5 h-3.5" />
                        <span>بدء الكشف</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default TodayAppointments;
