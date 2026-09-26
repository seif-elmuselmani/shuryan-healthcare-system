import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import doctorService from "@/api/services/doctor.service";

/**
 * Appointment Store - Manages appointment settings
 * 
 * Features:
 * - Weekly schedule (fixed working hours)
 * - Exceptional dates (holidays, special hours)
 * - Parallel data fetching
 * - Optimistic updates with rollback
 */
export const useAppointmentStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==================== State ====================
        
        // Weekly Schedule (7 days)
        weeklySchedule: {
          saturday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
          sunday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
          monday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
          tuesday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
          wednesday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
          thursday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
          friday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
        },
        
        // Exceptional Dates
        exceptionalDates: [],
        
        // Loading States
        loading: {
          schedule: false,
          exceptions: false,
        },
        
        // Error States
        error: {
          schedule: null,
          exceptions: null,
        },
        
        // Success Messages
        success: {
          schedule: null,
          exceptions: null,
        },

        // ==================== Actions ====================
        
        /**
         * Fetch weekly schedule
         * Backend returns 12-hour format directly - NO CONVERSION NEEDED!
         */
        fetchWeeklySchedule: async () => {
          set((state) => ({
            loading: { ...state.loading, schedule: true },
            error: { ...state.error, schedule: null },
          }));

          try {
            const response = await doctorService.getWeeklySchedule();
            const data = response.data || response;
            
            console.log('📅 Backend schedule:', data.weeklySchedule);

            // Backend returns 12-hour format with periods - use directly
            set({
              weeklySchedule: data.weeklySchedule || get().weeklySchedule,
              loading: { ...get().loading, schedule: false },
            });
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, schedule: false },
              error: { 
                ...state.error, 
                schedule: error.response?.data?.message || 'فشل تحميل جدول المواعيد' 
              },
            }));
            throw error;
          }
        },

        /**
         * Update weekly schedule
         * Backend accepts 12-hour format directly - NO CONVERSION NEEDED!
         * @param {Object} scheduleData - Weekly schedule data
         */
        updateWeeklySchedule: async (scheduleData) => {
          const previousSchedule = get().weeklySchedule;

          // Validate enabled days have complete times
          const enabledDays = Object.entries(scheduleData).filter(([_, s]) => s.enabled);
          for (const [day, schedule] of enabledDays) {
            if (!schedule.fromTime || !schedule.toTime || 
                !schedule.fromTime.includes(':') || !schedule.toTime.includes(':')) {
              throw new Error(`اليوم ${day} مفعل لكن الأوقات غير مكتملة`);
            }
          }

          // Backend accepts 12-hour format directly - NO CONVERSION NEEDED!
          const payload = {};
          Object.keys(scheduleData).forEach(day => {
            const schedule = scheduleData[day];
            
            payload[day] = {
              enabled: schedule.enabled,
              fromTime: schedule.fromTime || '',
              toTime: schedule.toTime || '',
              fromPeriod: schedule.fromPeriod || 'AM',
              toPeriod: schedule.toPeriod || 'PM',
            };
          });

          console.log('📅 Schedule data (12h):', scheduleData);
          console.log('📅 Payload to backend:', JSON.stringify({ weeklySchedule: payload }, null, 2));

          // Optimistic update
          set((state) => ({
            weeklySchedule: scheduleData,
            loading: { ...state.loading, schedule: true },
            error: { ...state.error, schedule: null },
            success: { ...state.success, schedule: null },
          }));

          try {
            const result = await doctorService.updateWeeklySchedule(payload);
            console.log('✅ Backend response:', result);

            set((state) => ({
              loading: { ...state.loading, schedule: false },
              success: { ...state.success, schedule: 'تم حفظ جدول المواعيد بنجاح' },
            }));

            // Auto-clear success message
            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, schedule: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            console.error('❌ Update schedule error:', error);
            console.error('❌ Error response:', error.response?.data);
            
            // Rollback
            set((state) => ({
              weeklySchedule: previousSchedule,
              loading: { ...state.loading, schedule: false },
              error: { 
                ...state.error, 
                schedule: error.response?.data?.message || error.message || 'فشل حفظ جدول المواعيد' 
              },
            }));
            
            // Show alert with error details
            const errorMsg = error.response?.data?.message || error.message || 'فشل حفظ جدول المواعيد';
            alert(`❌ ${errorMsg}`);
            
            return { success: false, error };
          }
        },

        /**
         * Fetch exceptional dates
         */
        fetchExceptionalDates: async () => {
          set((state) => ({
            loading: { ...state.loading, exceptions: true },
            error: { ...state.error, exceptions: null },
          }));

          try {
            const response = await doctorService.getExceptionalDates();
            console.log('📅 Fetch exceptions response:', response);
            
            // Handle new response format: { isSuccess, data: { exceptionalDates: [...] } }
            const data = response.data || response;
            const exceptions = data.exceptionalDates || data.data?.exceptionalDates || data || [];
            
            console.log('📅 Parsed exceptions:', exceptions);

            set({
              exceptionalDates: exceptions,
              loading: { ...get().loading, exceptions: false },
            });
          } catch (error) {
            console.error('📅 Failed to fetch exceptions:', error);
            set((state) => ({
              loading: { ...state.loading, exceptions: false },
              error: { 
                ...state.error, 
                exceptions: error.response?.data?.message || 'فشل تحميل المواعيد الاستثنائية' 
              },
            }));
            throw error;
          }
        },

        /**
         * Add exceptional date
         * @param {Object} exceptionData - Exception data
         */
        addExceptionalDate: async (exceptionData) => {
          const previousExceptions = get().exceptionalDates;
          
          console.log('📅 Adding exceptional date:', exceptionData);

          // Optimistic update
          const newException = { ...exceptionData, id: Date.now() };
          set((state) => ({
            exceptionalDates: [...state.exceptionalDates, newException],
            loading: { ...state.loading, exceptions: true },
            error: { ...state.error, exceptions: null },
          }));

          try {
            const response = await doctorService.addExceptionalDate(exceptionData);
            console.log('📅 Exception added successfully:', response);
            
            // Handle new response format: { isSuccess, data: {...} }
            const responseData = response.data || response;
            const savedException = responseData.data || responseData;
            
            console.log('📅 Saved exception:', savedException);

            // Update with server ID
            set((state) => ({
              exceptionalDates: state.exceptionalDates.map(ex => 
                ex.id === newException.id ? { ...ex, id: savedException.id } : ex
              ),
              loading: { ...state.loading, exceptions: false },
              success: { ...state.success, exceptions: responseData.message || 'تم إضافة الموعد الاستثنائي بنجاح' },
            }));

            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, exceptions: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            console.error('📅 Failed to add exception:', error);
            console.error('📅 Error response:', error.response);
            
            // Rollback
            set((state) => ({
              exceptionalDates: previousExceptions,
              loading: { ...state.loading, exceptions: false },
              error: { 
                ...state.error, 
                exceptions: error.response?.data?.message || 'فشل إضافة الموعد الاستثنائي' 
              },
            }));
            return { success: false, error };
          }
        },

        /**
         * Remove exceptional date
         * @param {string|number} exceptionId - Exception ID
         */
        removeExceptionalDate: async (exceptionId) => {
          const previousExceptions = get().exceptionalDates;

          // Optimistic update
          set((state) => ({
            exceptionalDates: state.exceptionalDates.filter(ex => ex.id !== exceptionId),
            loading: { ...state.loading, exceptions: true },
            error: { ...state.error, exceptions: null },
          }));

          try {
            await doctorService.removeExceptionalDate(exceptionId);

            set((state) => ({
              loading: { ...state.loading, exceptions: false },
              success: { ...state.success, exceptions: 'تم حذف الموعد الاستثنائي بنجاح' },
            }));

            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, exceptions: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            // Rollback
            set((state) => ({
              exceptionalDates: previousExceptions,
              loading: { ...state.loading, exceptions: false },
              error: { 
                ...state.error, 
                exceptions: error.response?.data?.message || 'فشل حذف الموعد الاستثنائي' 
              },
            }));
            return { success: false, error };
          }
        },

        /**
         * Fetch all appointment data in parallel
         */
        fetchAllAppointmentData: async () => {
          const results = await Promise.allSettled([
            get().fetchWeeklySchedule(),
            get().fetchExceptionalDates(),
          ]);

          // Check for errors
          const errors = results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason?.message || 'خطأ غير معروف');

          if (errors.length > 0) {
            console.error('Errors fetching appointment data:', errors);
          }
        },

        /**
         * Clear errors
         */
        clearErrors: () => {
          set({
            error: {
              schedule: null,
              exceptions: null,
            },
          });
        },

        /**
         * Clear success messages
         */
        clearSuccess: () => {
          set({
            success: {
              schedule: null,
              exceptions: null,
            },
          });
        },

        /**
         * Reset appointment store
         */
        resetAppointmentStore: () => {
          set({
            weeklySchedule: {
              saturday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
              sunday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
              monday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
              tuesday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
              wednesday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
              thursday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
              friday: { enabled: false, fromTime: '', toTime: '', fromPeriod: 'AM', toPeriod: 'PM' },
            },
            exceptionalDates: [],
            loading: {
              schedule: false,
              exceptions: false,
            },
            error: {
              schedule: null,
              exceptions: null,
            },
            success: {
              schedule: null,
              exceptions: null,
            },
          });
        },
      }),
      {
        name: 'appointment-storage',
        partialize: (state) => ({
          weeklySchedule: state.weeklySchedule,
          exceptionalDates: state.exceptionalDates,
        }),
      }
    ),
    { name: 'AppointmentStore' }
  )
);
