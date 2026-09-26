import React, { useState, useEffect } from "react";
import { useAppointment } from "../hooks/useAppointment";
import WeeklyScheduleCalendar from "./WeeklyScheduleCalendar";
import ExceptionCard from "./ExceptionCard";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCalendarDay,
  FaCalendarPlus,
  FaPlus
} from "react-icons/fa";
import "../../../styles/calendar-custom.css";

/**
 * AppointmentSection Component
 * 
 * Features:
 * - Weekly schedule management
 * - Exceptional dates management
 * - Edit mode toggle
 * - Success/Error feedback
 */
const AppointmentSection = () => {
  const {
    weeklySchedule,
    exceptionalDates,
    loading,
    error,
    success,
    updateSchedule,
    addException,
    removeException,
    clearErrors,
    enabledDays,
  } = useAppointment({ autoFetch: true });

  // Local state for form values
  const [localSchedule, setLocalSchedule] = useState(weeklySchedule);
  const [newException, setNewException] = useState({
    date: '',
    fromTime: '',
    toTime: '',
    fromPeriod: 'AM',
    toPeriod: 'PM',
    isClosed: false
  });

  // Days configuration (for summary display)
  const daysOfWeek = [
    { key: 'saturday', name: 'السبت', color: 'bg-pink-500' },
    { key: 'sunday', name: 'الأحد', color: 'bg-red-500' },
    { key: 'monday', name: 'الاثنين', color: 'bg-blue-500' },
    { key: 'tuesday', name: 'الثلاثاء', color: 'bg-green-500' },
    { key: 'wednesday', name: 'الأربعاء', color: 'bg-yellow-500' },
    { key: 'thursday', name: 'الخميس', color: 'bg-purple-500' },
    { key: 'friday', name: 'الجمعة', color: 'bg-indigo-500' }
  ];

  // Sync store data to local state
  useEffect(() => {
    setLocalSchedule(weeklySchedule);
  }, [weeklySchedule]);

  // Auto-save effect for schedule - saves after 3 seconds of inactivity
  useEffect(() => {
    // Skip if localSchedule is not loaded yet
    if (!localSchedule || Object.keys(localSchedule).length === 0) {
      return;
    }

    // Check if data has changed
    const hasChanged = JSON.stringify(localSchedule) !== JSON.stringify(weeklySchedule);
    if (!hasChanged) {
      return;
    }

    // Validate before auto-save
    const enabledDaysKeys = Object.keys(localSchedule).filter(
      key => localSchedule[key]?.enabled
    );

    let isValid = true;
    for (const dayKey of enabledDaysKeys) {
      const day = localSchedule[dayKey];
      if (!day.fromTime || !day.toTime || !day.fromTime.includes(':') || !day.toTime.includes(':')) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    // Auto-save after 3 seconds
    const timer = setTimeout(async () => {
      try {
        await updateSchedule(localSchedule);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [localSchedule]);

  // Handle add exception
  const handleAddException = async () => {
    if (!newException.date) {
      alert('⚠️ يرجى تحديد التاريخ');
      return;
    }

    if (!newException.isClosed && (!newException.fromTime || !newException.toTime)) {
      alert('⚠️ يرجى تحديد أوقات العمل أو تفعيل "يوم إجازة"');
      return;
    }

    try {
      // Format data for backend - Keep 12h format with periods
      const exceptionData = {
        date: newException.date,
        fromTime: newException.isClosed ? null : newException.fromTime,
        toTime: newException.isClosed ? null : newException.toTime,
        fromPeriod: newException.isClosed ? null : newException.fromPeriod,
        toPeriod: newException.isClosed ? null : newException.toPeriod,
        isClosed: newException.isClosed
      };
      
      console.log('📅 Sending exception data:', exceptionData);
      
      const result = await addException(exceptionData);
      if (result.success) {
        // Reset form
        setNewException({
          date: '',
          fromTime: '',
          toTime: '',
          fromPeriod: 'AM',
          toPeriod: 'PM',
          isClosed: false
        });
      }
    } catch (error) {
      console.error('Error adding exception:', error);
    }
  };

  // Handle remove exception
  const handleRemoveException = async (exceptionId) => {
    try {
      await removeException(exceptionId);
    } catch (error) {
      console.error('Error removing exception:', error);
    }
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">إعدادات المواعيد</h3>
              <p className="text-white/80 text-sm">
                تحديد أوقات العمل وإعدادات حجز المواعيد
              </p>
            </div>
          </div>
          
          {/* Action Buttons - Removed for auto-save */}
          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Success Messages */}
        {(success.schedule || success.exceptions) && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-medium">
              ✅ {success.schedule || success.exceptions}
            </p>
          </div>
        )}

        {/* Error Messages */}
        {(error.schedule || error.exceptions) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium">
              ❌ {error.schedule || error.exceptions}
            </p>
          </div>
        )}

        {/* Summary Section - Always visible */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <FaClock className="w-5 h-5 text-slate-600" />
            <h4 className="text-lg font-semibold text-slate-800">ملخص أوقات العمل</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-slate-700 mb-3">الأيام المفعلة:</h5>
              <div className="space-y-2">
                {daysOfWeek.filter(day => localSchedule[day.key]?.enabled).map(day => {
                  const schedule = localSchedule[day.key];
                  return (
                    <div key={day.key} className="flex items-center gap-3 text-sm">
                      <div className={`w-4 h-4 ${day.color} rounded`}></div>
                      <span className="font-medium">{day.name}:</span>
                      <span className="text-slate-600">
                        {schedule.fromTime} {schedule.fromPeriod === 'AM' ? 'ص' : 'م'} - {schedule.toTime} {schedule.toPeriod === 'AM' ? 'ص' : 'م'}
                      </span>
                    </div>
                  );
                })}
                {enabledDays.length === 0 && (
                  <p className="text-slate-500 text-sm">لم يتم تفعيل أي أيام</p>
                )}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-slate-700 mb-3">المواعيد الاستثنائية:</h5>
              <div className="text-sm text-slate-600">
                {exceptionalDates.length > 0 ? (
                  <span>{exceptionalDates.length} موعد استثنائي محدد</span>
                ) : (
                  <span>لا توجد مواعيد استثنائية</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Part 1: Fixed Weekly Schedule - New Calendar View */}
        <WeeklyScheduleCalendar
          weeklySchedule={localSchedule}
          isEditing={true}
          onScheduleChange={setLocalSchedule}
          exceptionalDates={exceptionalDates}
          onRemoveException={removeException}
          newException={newException}
          onNewExceptionChange={setNewException}
          onAddException={handleAddException}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AppointmentSection;
