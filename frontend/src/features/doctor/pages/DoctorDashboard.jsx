import React, { useMemo, useState, useEffect } from "react";
import DoctorDashboardBody from "../components/DoctorDashboardBody";
import TodayAppointments from "../components/TodayAppointments";
import DashboardFooter from "../components/DashboardFooter";
import SessionModal from "../components/SessionModal";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useTodayAppointments } from "../hooks/useTodayAppointments";
import { useSessionManager } from "../hooks/useSessionManager";
import { isAppointmentCompleted } from "@/utils/appointmentStatus";
import sessionService from "@/api/services/session.service";
import signalRService from "@/services/signalr.service";
import useAuth from "@/features/auth/hooks/useAuth";

/**
 * Doctor Dashboard Page
 * Main dashboard for doctors with clean architecture
 * @component
 */
const DoctorDashboard = () => {
  const { accessToken } = useAuth();
  const { stats, loading, error, refreshStats } = useDashboardStats();
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError, 
    refreshAppointments
  } = useTodayAppointments();
  const { startOrResumeSession, sessionLoading, sessionError, clearSessionError } = useSessionManager();

  // Filter state
  const [filterType, setFilterType] = useState('all');

  // Active session from API
  const [activeSessionFromAPI, setActiveSessionFromAPI] = useState(null);

  // Session Modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  /**
   * Format time from 24-hour to 12-hour with AM/PM in Arabic
   * @param {string} time24 - Time in 24-hour format (HH:mm or HH:mm:ss)
   * @returns {string} Time in 12-hour format with Arabic AM/PM
   */
  const formatTime = (time24) => {
    if (!time24) return '--:--';
    const parts = time24.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parts[1];
    const period = hours >= 12 ? 'م' : 'ص';
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  // SignalR: Connect and setup listener for new appointments
  useEffect(() => {
    if (!accessToken) {
      console.warn('[DoctorDashboard] No access token, skipping SignalR connection');
      return;
    }

    let isSubscribed = true;

    const initializeSignalR = async () => {
      try {
        console.log('[DoctorDashboard] 🔌 Initializing SignalR connection...');
        console.log('[DoctorDashboard] Connection state before:', signalRService.getConnectionState());

        // Connect to SignalR if not already connected
        if (!signalRService.isConnected) {
          await signalRService.connect(accessToken);
          console.log('[DoctorDashboard] ✅ SignalR connected successfully');
        } else {
          console.log('[DoctorDashboard] ℹ️ SignalR already connected');
        }

        console.log('[DoctorDashboard] Connection state after:', signalRService.getConnectionState());
        console.log('[DoctorDashboard] 📡 Registering listener for NewAppointmentToday');

        // Setup listener for new appointments
        const handleNewAppointment = (appointmentData) => {
          if (!isSubscribed) {
            console.log('[DoctorDashboard] ⚠️ Component unmounted, ignoring event');
            return;
          }

          console.log('═══════════════════════════════════════');
          console.log('📡 [SignalR] NewAppointmentToday EVENT RECEIVED!');
          console.log('📡 [SignalR] Raw data:', JSON.stringify(appointmentData, null, 2));
          console.log('═══════════════════════════════════════');
          
          try {
            // Map the appointment data to frontend format
            const formattedTime = formatTime(appointmentData.appointmentTime);
            
            const newAppointment = {
              id: appointmentData.id,
              patientId: appointmentData.patientId,
              patientName: appointmentData.patientName,
              patientInitial: appointmentData.patientName?.charAt(0) || '؟',
              phoneNumber: appointmentData.patientPhoneNumber,
              time: formattedTime,
              appointmentDate: appointmentData.appointmentDate,
              duration: appointmentData.duration,
              status: appointmentData.appointmentType === 'regular' ? 'كشف عام' : 'متابعة',
              appointmentType: appointmentData.appointmentType,
              apiStatus: appointmentData.status || 'Confirmed',
              notes: appointmentData.notes,
              price: appointmentData.price,
            };

            console.log('✅ [SignalR] Formatted appointment:', newAppointment);
            console.log('🔄 [SignalR] Calling refreshAppointments()...');

            // Refresh appointments to get the new one
            refreshAppointments();
            
            console.log('🔄 [SignalR] Calling refreshStats()...');
            // Refresh stats to update counters
            refreshStats();

            // Show notification to doctor
            const notificationMessage = `موعد جديد: ${appointmentData.patientName} - ${formattedTime}`;
            
            console.log('🔔 [SignalR] Showing notification:', notificationMessage);

            // Browser notification if supported and permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('موعد جديد اليوم', {
                body: notificationMessage,
                icon: '/logo.png',
                badge: '/logo.png',
              });
            }
            
            
            console.log('✅ [SignalR] Dashboard updated with new appointment');
            console.log('═══════════════════════════════════════');
          } catch (error) {
            console.error('❌ [SignalR] Error handling new appointment:', error);
            console.error('❌ [SignalR] Error stack:', error.stack);
          }
        };

        // Register the primary listener
        signalRService.on('NewAppointmentToday', handleNewAppointment);
        console.log('[DoctorDashboard] ✅ Listener registered for: NewAppointmentToday');

        // ⚠️ DEBUGGING: Try alternative event names (case variations)
        signalRService.on('newAppointmentToday', (data) => {
          console.log('⚠️ [DEBUG] Received event: newAppointmentToday (lowercase)', data);
          handleNewAppointment(data);
        });

        signalRService.on('ReceiveNotification', (notification) => {
          console.log('⚠️ [DEBUG] Received event: ReceiveNotification');
          console.log('⚠️ [DEBUG] Full notification object:', JSON.stringify(notification, null, 2));
          console.log('⚠️ [DEBUG] notification.title:', notification.title);
          console.log('⚠️ [DEBUG] notification.data:', notification.data);
          
          // Check if it's a new appointment notification
          if (notification.title === 'NewAppointmentToday') {
            console.log('📌 This is a NewAppointmentToday notification, processing...');
            
            // الـ appointment data موجود في notification.data
            const appointmentData = notification.data;
            
            if (appointmentData) {
              handleNewAppointment(appointmentData);
            } else {
              console.error('❌ [DEBUG] notification.data is empty or null!');
            }
          } else {
            console.log('ℹ️ [DEBUG] Different notification type:', notification.title);
          }
        });

        // Generic catch-all for debugging
        signalRService.on('receiveNotification', (data) => {
          console.log('⚠️ [DEBUG] Received event: receiveNotification (lowercase)', data);
        });

        console.log('[DoctorDashboard] ✅ All listeners registered successfully');

      } catch (error) {
        console.error('[DoctorDashboard] ❌ SignalR initialization failed:', error);
        console.error('[DoctorDashboard] ❌ Error details:', error.message);
        console.error('[DoctorDashboard] ❌ Error stack:', error.stack);
      }
    };

    initializeSignalR();

    // Cleanup
    return () => {
      console.log('[DoctorDashboard] 🧹 Cleaning up SignalR listeners');
      isSubscribed = false;
      signalRService.off('NewAppointmentToday');
      signalRService.off('newAppointmentToday');
      signalRService.off('ReceiveNotification');
      signalRService.off('receiveNotification');
    };
  }, [accessToken, refreshAppointments, refreshStats]);

  // Check for active session on mount and after refresh
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const result = await sessionService.getDoctorActiveSession();
        if (result.success && result.isActive && result.data) {
          console.log('🟢 Found active session:', result.data.appointmentId);
          setActiveSessionFromAPI(result.data);
        } else {
          setActiveSessionFromAPI(null);
        }
      } catch (error) {
        console.error('❌ Error checking active session:', error);
      }
    };

    checkActiveSession();
  }, [appointments]); // Re-check when appointments change


  /**
   * Handle stat card click
   * Navigate to relevant section or show details
   */
  const handleStatClick = (stat) => {
    console.log('Stat clicked:', stat);
  };

  /**
   * Handle enter session (start, resume, or view completed)
   */
  const handleStartAppointment = async (appointment) => {
    console.log('🔵 handleStartAppointment called');
    console.log('🔵 Appointment ID:', appointment.id);
    console.log('🔵 Appointment apiStatus:', appointment.apiStatus);
    console.log('🔵 Appointment apiStatus type:', typeof appointment.apiStatus);

    // Check if session is completed (using helper function)
    const isCompleted = isAppointmentCompleted(appointment.apiStatus);

    console.log('🔵 isCompleted:', isCompleted);

    // For both completed and active sessions, open modal
    console.log('🔵 Calling startOrResumeSession...');

    // Start or resume session
    const result = await startOrResumeSession(appointment);

    if (result.success) {
      // Update active session immediately
      setActiveSessionFromAPI({
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        status: 'InProgress'
      });

      // Open session modal immediately
      setSelectedAppointment(appointment);
      setIsSessionModalOpen(true);

      console.log('✅ Session started, UI updated immediately');
    } else {
      // Show error with better formatting
      const errorMsg = result.error || 'حدث خطأ غير متوقع';

      // If there's an active session, offer to go to it
      if (errorMsg.includes('جلسة نشطة') && activeSessionFromAPI) {
        const goToActive = window.confirm(
          `❌ ${errorMsg}\n\n` +
          `الجلسة النشطة مع: ${activeSessionFromAPI.patientName}\n\n` +
          `هل تريد الذهاب إلى الجلسة النشطة؟`
        );

        if (goToActive) {
          // Find the active appointment
          const activeApt = appointments.find(apt => apt.id === activeSessionFromAPI.appointmentId);
          if (activeApt) {
            setSelectedAppointment(activeApt);
            setIsSessionModalOpen(true);
          }
        }
      } else {
        alert(`❌ خطأ في بدء الجلسة:\n\n${errorMsg}`);
      }
    }
  };

  /**
   * Handle close session modal
   */
  const handleCloseSessionModal = async () => {
    setIsSessionModalOpen(false);
    setSelectedAppointment(null);

    // Check if session is still active
    try {
      const result = await sessionService.getDoctorActiveSession();
      if (result.success && result.isActive && result.data) {
        // Session still active
        setActiveSessionFromAPI(result.data);
      } else {
        // Session ended
        setActiveSessionFromAPI(null);
      }
    } catch (error) {
      console.error('❌ Error checking session status:', error);
    }

    // Refresh appointments
    refreshAppointments();
  };

  /**
   * Separate appointments by status
   * Now includes InProgress appointments in the list
   */
  const { displayedAppointments, activeSession } = useMemo(() => {
    console.log('🔄 useMemo: Processing appointments', appointments.length);
    console.log('🔄 Active session from API:', activeSessionFromAPI?.appointmentId);

    // Update appointments with active session status
    const updatedAppointments = appointments.map(apt => {
      // If this appointment has an active session, update its status
      if (activeSessionFromAPI && apt.id === activeSessionFromAPI.appointmentId) {
        console.log('🟢 Updating appointment status to InProgress:', apt.id);
        return {
          ...apt,
          apiStatus: 'InProgress' // Force InProgress status
        };
      }
      return apt;
    });

    // Display appointments that are: Pending, Confirmed, or InProgress
    const displayed = updatedAppointments.filter(apt => {
      const isDisplayed = apt.apiStatus === 'pending' ||
        apt.apiStatus === 'Confirmed' ||
        apt.apiStatus === 1 ||
        apt.apiStatus === 'InProgress' ||
        apt.apiStatus === 3;

      console.log(`📋 Appointment ${apt.id}:`, {
        patientName: apt.patientName,
        apiStatus: apt.apiStatus,
        isDisplayed
      });

      return isDisplayed;
    });

    const active = updatedAppointments.find(apt => {
      // InProgress (active session)
      return apt.apiStatus === 'InProgress' || apt.apiStatus === 3;
    });

    console.log('✅ Displayed appointments:', displayed.length);
    console.log('✅ Active session:', active ? active.patientName : 'None');

    return { displayedAppointments: displayed, activeSession: active };
  }, [appointments, activeSessionFromAPI]);

  /**
   * Filter displayed appointments based on selected type
   */
  const filteredAppointments = useMemo(() => {
    if (filterType === 'all') return displayedAppointments;
    return displayedAppointments.filter(apt => apt.status === filterType);
  }, [displayedAppointments, filterType]);

  /**
   * Handle filter change - Set specific filter type
   */
  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
  };

  /**
   * Note: Auto-refresh removed - SignalR provides real-time updates
   * No need for polling when using WebSocket connections
   * 
   * SignalR events that trigger updates:
   * - NewAppointmentToday: Refreshes appointments + stats
   * - AppointmentCancelled: Refreshes appointments + stats (if implemented)
   * - SessionCompleted: Refreshes appointments + stats (if implemented)
   */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-emerald-50/20">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State - Stats */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">جاري تحميل الإحصائيات...</p>
            </div>
          </div>
        )}

        {/* Error State - Stats */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-bold text-lg mb-1">حدث خطأ في تحميل الإحصائيات</h3>
                <p className="text-red-600">{error}</p>
              </div>
              <button
                onClick={refreshStats}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Body */}
        {!loading && !error && (
          <DoctorDashboardBody stats={stats} onStatClick={handleStatClick} />
        )}

        {/* Error State - Session */}
        {sessionError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-bold text-lg mb-1">خطأ في بدء الجلسة</h3>
                <p className="text-red-600">{sessionError}</p>
              </div>
              <button
                onClick={clearSessionError}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* Error State - Appointments */}
        {appointmentsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-bold text-lg mb-1">حدث خطأ في تحميل المواعيد</h3>
                <p className="text-red-600">{appointmentsError}</p>
              </div>
              <button
                onClick={() => refreshAppointments()}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {/* Active Session Card */}
        {activeSession && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl font-black text-orange-600">
                        {activeSession.patientInitial}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                        جلسة نشطة
                      </span>
                      <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        ● جارية الآن
                      </span>
                    </div>
                    <h3 className="text-white font-black text-xl mb-1">
                      {activeSession.patientName}
                    </h3>
                    <p className="text-white/90 text-sm">
                      بدأت الساعة {activeSession.time} • {activeSession.duration} دقيقة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAppointment(activeSession)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <span>متابعة الجلسة</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Today's Appointments - Pending Only */}
        <TodayAppointments
          appointments={filteredAppointments}
          filterType={filterType}
          onStartAppointment={handleStartAppointment}
          onFilterChange={handleFilterChange}
          loading={appointmentsLoading}
          sessionLoading={sessionLoading}
        />
      </main>

      {/* Footer */}
      <DashboardFooter />

      {/* Session Modal */}
      {isSessionModalOpen && selectedAppointment && (
        <SessionModal
          isOpen={isSessionModalOpen}
          onClose={handleCloseSessionModal}
          appointmentId={selectedAppointment.id}
          appointmentData={selectedAppointment}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
