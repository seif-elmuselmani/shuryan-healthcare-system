import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import patientService from "@/api/services/patient.service";

/**
 * Patient Appointments Store
 * Manages patient's appointments (upcoming & past)
 */
const useAppointmentsStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==========================================
        // State
        // ==========================================
        upcomingAppointments: [],
        pastAppointments: [],
        selectedAppointment: null,
        loading: false,
        error: null,
        
        // Active tab
        activeTab: 'upcoming', // 'upcoming' | 'past'
        
        // Filters
        filters: {
          searchTerm: '',
        },

        // ==========================================
        // Actions
        // ==========================================

        /**
         * Fetch upcoming appointments
         */
        fetchUpcomingAppointments: async () => {
          set({ loading: true, error: null });
          
          try {
            console.log('📅 Fetching upcoming appointments...');
            
            const appointments = await patientService.getUpcomingAppointments();
            
            console.log('✅ Upcoming appointments:', appointments);
            
            set({
              upcomingAppointments: appointments || [],
              loading: false,
            });
          } catch (error) {
            console.error('❌ Error fetching upcoming appointments:', error);
            set({ 
              error: error.response?.data?.message || 'فشل في تحميل المواعيد القادمة',
              loading: false 
            });
          }
        },

        /**
         * Fetch past appointments
         */
        fetchPastAppointments: async () => {
          set({ loading: true, error: null });
          
          try {
            console.log('📅 Fetching past appointments...');
            
            const appointments = await patientService.getPastAppointments();
            
            set({
              pastAppointments: appointments,
              loading: false,
            });
          } catch (error) {
            console.error('❌ Error fetching past appointments:', error);
            set({ 
              error: error.response?.data?.message || 'فشل في تحميل المواعيد السابقة',
              loading: false 
            });
          }
        },

        /**
         * Fetch all appointments (both upcoming and past)
         */
        fetchAllAppointments: async () => {
          await Promise.all([
            get().fetchUpcomingAppointments(),
            get().fetchPastAppointments(),
          ]);
        },

        /**
         * Fetch appointment details
         */
        fetchAppointmentDetails: async (appointmentId) => {
          set({ loading: true, error: null });
          
          try {
            console.log('📋 Fetching appointment details:', appointmentId);
            
            const appointment = await patientService.getAppointmentDetails(appointmentId);
            
            console.log('✅ Appointment details:', appointment);
            
            set({
              selectedAppointment: appointment,
              loading: false,
            });
          } catch (error) {
            console.error('❌ Error fetching appointment details:', error);
            set({ 
              error: error.response?.data?.message || 'فشل في تحميل تفاصيل الموعد',
              loading: false 
            });
          }
        },

        /**
         * Cancel appointment
         */
        cancelAppointment: async (appointmentId, cancellationReason) => {
          set({ loading: true, error: null });
          
          try {
            console.log('❌ Cancelling appointment:', appointmentId, cancellationReason);
            
            await patientService.cancelAppointment(appointmentId, cancellationReason);
            
            console.log('✅ Appointment cancelled successfully');
            
            // Refresh appointments list
            await get().fetchAllAppointments();
            
            set({ loading: false });
            
            return { success: true };
          } catch (error) {
            console.error('❌ Error cancelling appointment:', error);
            set({ 
              error: error.response?.data?.message || 'فشل في إلغاء الموعد',
              loading: false 
            });
            return { success: false, error: error.response?.data?.message };
          }
        },

        /**
         * Reschedule appointment
         */
        rescheduleAppointment: async (appointmentId, newStartTime, newEndTime) => {
          set({ loading: true, error: null });
          
          try {
            console.log('🔄 Rescheduling appointment:', appointmentId);
            console.log('🔄 New Start Time:', newStartTime);
            console.log('🔄 New End Time:', newEndTime);
            
            const result = await patientService.rescheduleAppointment(appointmentId, {
              newScheduledStartTime: newStartTime,
              newScheduledEndTime: newEndTime,
            });
            
            console.log('✅ Appointment rescheduled successfully:', result);
            
            // Refresh appointments list
            await get().fetchAllAppointments();
            
            set({ loading: false });
            
            return { success: true };
          } catch (error) {
            console.error('❌ Error rescheduling appointment:', error);
            console.error('❌ Error details:', error.response?.data);
            set({ 
              error: error.response?.data?.message || 'فشل في إعادة جدولة الموعد',
              loading: false 
            });
            return { success: false, error: error.response?.data?.message };
          }
        },

        /**
         * Set active tab
         */
        setActiveTab: (tab) => {
          set({ activeTab: tab });
        },

        /**
         * Set search term (local filter)
         */
        setSearchTerm: (searchTerm) => {
          set((state) => ({
            filters: {
              ...state.filters,
              searchTerm,
            },
          }));
        },

        /**
         * Reset filters
         */
        resetFilters: () => {
          set({
            filters: {
              searchTerm: '',
            },
          });
        },

        /**
         * Get filtered appointments (client-side search)
         */
        getFilteredAppointments: () => {
          const { upcomingAppointments, pastAppointments, activeTab, filters } = get();
          
          const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;
          
          if (!filters.searchTerm) {
            return appointments;
          }
          
          const searchLower = filters.searchTerm.toLowerCase();
          
          return appointments.filter((apt) => {
            // Search by doctor name (support both formats)
            const doctorName = apt.doctor?.fullName || apt.doctorName || '';
            return doctorName.toLowerCase().includes(searchLower);
          });
        },
      }),
      {
        name: 'patient-appointments-storage',
        partialize: (state) => ({
          activeTab: state.activeTab,
        }),
      }
    ),
    { name: 'PatientAppointmentsStore' }
  )
);

export default useAppointmentsStore;
