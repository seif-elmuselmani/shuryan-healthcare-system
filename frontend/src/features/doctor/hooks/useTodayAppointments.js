import { useState, useEffect } from "react";
import doctorService from "@/api/services/doctor.service";

/**
 * Custom Hook for Today's Appointments
 * Fetches all appointments for today (no pagination)
 * @returns {Object} { appointments, loading, error, refreshAppointments }
 */
export const useTodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Get today's date in YYYY-MM-DD format
   */
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Fetch today's appointments from API
   */
  const fetchAppointments = async (pageNumber = 1, pageSize = 5) => {
    console.log('🚀 fetchAppointments called with:', { pageNumber, pageSize });
    console.log('📅 Today\'s date:', getTodayDate());
    
    setLoading(true);
    setError(null);

    try {
      const response = await doctorService.getTodayAppointments({ pageNumber, pageSize });
      
      console.log('═══════════════════════════════════════');
      console.log('📡 RAW API Response:', response);
      console.log('📡 response.isSuccess:', response.isSuccess);
      console.log('📡 response.data exists:', !!response.data);
      console.log('📡 Full Response Structure:', JSON.stringify(response, null, 2));
      console.log('═══════════════════════════════════════');
      
      if (response.isSuccess && response.data) {
        const { data: appointmentsData, ...paginationData } = response.data;
        
        console.log('📋 Appointments Data (ALL from API):', appointmentsData);
        console.log('📋 Is Array?', Array.isArray(appointmentsData));
        console.log('📋 Count (Before Filter):', appointmentsData?.length);
        console.log('📋 Pagination Data:', paginationData);
        
        // ✅ Backend handles pagination correctly - just use the data
        if (!appointmentsData || appointmentsData.length === 0) {
          console.log('ℹ️ No appointments today.');
          setAppointments([]);
          setLoading(false);
          return;
        }
        
        console.log('🔍 First Appointment RAW:', appointmentsData[0]);
        console.log('🔍 First Appointment Date:', appointmentsData[0]?.appointmentDate);
        console.log('🔍 First Appointment Keys:', Object.keys(appointmentsData[0]));
        
        // ✅ Backend already filters by date, no need to filter again
        console.log('═══════════════════════════════════════');
        console.log('✅ Today\'s Appointments from API:', appointmentsData);
        console.log('✅ Today Appointments Count:', appointmentsData.length);
        console.log('═══════════════════════════════════════');
        
        // Map API data to frontend format
        const mappedAppointments = appointmentsData.map(mapAppointment);
        console.log('✅ Mapped Appointments:', mappedAppointments);
        
        if (mappedAppointments.length > 0) {
          console.log('✅ First Mapped Appointment:', mappedAppointments[0]);
        }
        
        setAppointments(mappedAppointments);
      } else {
        console.error('❌ Response validation failed:', {
          isSuccess: response.isSuccess,
          hasData: !!response.data,
          message: response.message
        });
        throw new Error(response.message || 'فشل في تحميل المواعيد');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في تحميل المواعيد';
      setError(errorMessage);
      console.error('═══════════════════════════════════════');
      console.error('❌ Error fetching today appointments:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error response data:', err.response?.data);
      console.error('═══════════════════════════════════════');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Map API appointment data to frontend format
   */
  const mapAppointment = (apiData) => {
    console.log('🔄 Mapping appointment:', apiData);
    
    const mapped = {
      id: apiData.id,
      patientId: apiData.patientId,
      patientName: apiData.patientName,
      patientInitial: apiData.patientName?.charAt(0) || '؟',
      phoneNumber: apiData.patientPhoneNumber, // Changed from patientPhoneNumber to phoneNumber
      time: formatTime(apiData.appointmentTime),
      appointmentDate: apiData.appointmentDate,
      duration: apiData.duration,
      status: apiData.appointmentType === 'regular' ? 'كشف عام' : 'متابعة',
      appointmentType: apiData.appointmentType,
      apiStatus: apiData.status,
      notes: apiData.notes,
      price: apiData.price,
    };
    
    console.log('✅ Mapped to:', mapped);
    return mapped;
  };

  /**
   * Format time from 24-hour to 12-hour with AM/PM in Arabic
   * @param {string} time24 - Time in 24-hour format (HH:mm)
   * @returns {string} Time in 12-hour format with Arabic AM/PM
   */
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'م' : 'ص';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments(1, 100); // Get all today's appointments
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Refresh appointments - fetch all today's appointments
   */
  const refreshCurrentPage = () => {
    console.log('🔄 Refreshing today\'s appointments');
    return fetchAppointments(1, 100); // Get all appointments (up to 100)
  };

  return {
    appointments,
    loading,
    error,
    refreshAppointments: refreshCurrentPage,
  };
};
