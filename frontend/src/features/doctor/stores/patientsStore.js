import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import doctorService from "@/api/services/doctor.service";

export const usePatientsStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==================== State ====================
        patients: [],
        selectedPatient: null,
        loading: false,
        error: null,
        
        // Pagination
        pagination: {
          pageNumber: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },

        // Search & Filter
        searchTerm: '',
        filterStatus: 'all', // 'all' | 'recent' | 'archived'
        sortBy: 'lastVisit', // 'lastVisit' | 'name' | 'sessions'

        // Patient Details (for modals)
        medicalRecord: null,
        sessionDocumentations: null,
        prescriptions: null,
        detailsLoading: false,
        detailsError: null,

        // ==================== Actions ====================

        /**
         * Fetch patients list with pagination
         * Only returns patients with COMPLETED appointments
         */
        fetchPatients: async (pageNumber = 1, pageSize = 20) => {
          console.log('🚀 fetchPatients called:', { pageNumber, pageSize });
          set({ loading: true, error: null });
          
          try {
            const response = await doctorService.getPatients({ pageNumber, pageSize });
            
            console.log('═══════════════════════════════════════');
            console.log('📡 Patients API Response:', response);
            console.log('📡 response.isSuccess:', response.isSuccess);
            console.log('📡 response.data exists:', !!response.data);
            console.log('📡 Full Response:', JSON.stringify(response, null, 2));
            console.log('═══════════════════════════════════════');
            
            if (response.isSuccess && response.data) {
              const { data: patientsData, ...paginationData } = response.data;
              
              console.log('👥 Patients Data:', patientsData);
              console.log('👥 Patients Count:', patientsData?.length);
              console.log('👥 Pagination:', paginationData);
              
              if (patientsData && patientsData.length > 0) {
                console.log('🔍 First Patient:', patientsData[0]);
                console.log('🔍 First Patient Keys:', Object.keys(patientsData[0]));
              }
              
              set({
                patients: patientsData || [],
                pagination: paginationData,
                loading: false,
              });
              
              console.log('✅ Patients loaded successfully:', patientsData?.length || 0);
            } else {
              console.error('❌ Response validation failed:', {
                isSuccess: response.isSuccess,
                hasData: !!response.data,
                message: response.message
              });
              set({ 
                error: response.message || 'فشل في تحميل المرضى',
                loading: false 
              });
            }
          } catch (error) {
            console.error('═══════════════════════════════════════');
            console.error('❌ Error fetching patients:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error response data:', error.response?.data);
            console.error('═══════════════════════════════════════');
            
            // Check if it's 404 - use mock data temporarily
            if (error.response?.status === 404) {
              console.warn('⚠️ Patients endpoint not found - using mock data');
              
              // Mock data for testing
              const mockPatients = [
                {
                  id: '1',
                  fullName: 'أحمد محمد علي',
                  phoneNumber: '01012345678',
                  profileImageUrl: null,
                  totalSessions: 5,
                  lastVisitDate: '2025-10-25',
                  address: 'المعادي، القاهرة',
                  rating: 4.8,
                },
                {
                  id: '2',
                  fullName: 'فاطمة حسن',
                  phoneNumber: '01098765432',
                  profileImageUrl: null,
                  totalSessions: 3,
                  lastVisitDate: '2025-10-28',
                  address: 'مدينة نصر، القاهرة',
                  rating: 5.0,
                },
                {
                  id: '3',
                  fullName: 'محمود السيد',
                  phoneNumber: '01123456789',
                  profileImageUrl: null,
                  totalSessions: 8,
                  lastVisitDate: '2025-09-15',
                  address: 'الزمالك، القاهرة',
                  rating: 4.5,
                },
                {
                  id: '4',
                  fullName: 'نور الدين',
                  phoneNumber: '01156789012',
                  profileImageUrl: null,
                  totalSessions: 2,
                  lastVisitDate: '2025-10-29',
                  address: 'الدقي، الجيزة',
                  rating: 4.9,
                },
              ];
              
              set({
                patients: mockPatients,
                pagination: {
                  pageNumber: 1,
                  pageSize: 20,
                  totalCount: mockPatients.length,
                  totalPages: 1,
                  hasPreviousPage: false,
                  hasNextPage: false,
                },
                loading: false,
              });
            } else {
              set({ 
                error: error.response?.data?.message || error.message || 'حدث خطأ في تحميل المرضى',
                loading: false 
              });
            }
          }
        },

        /**
         * Fetch patient by ID
         */
        fetchPatientById: async (patientId) => {
          set({ loading: true, error: null });
          
          try {
            const response = await doctorService.getPatientById(patientId);
            
            if (response.isSuccess && response.data) {
              set({
                selectedPatient: response.data,
                loading: false,
              });
              return response.data;
            } else {
              set({ 
                error: response.message || 'فشل في تحميل بيانات المريض',
                loading: false 
              });
              return null;
            }
          } catch (error) {
            console.error('❌ Error fetching patient:', error);
            set({ 
              error: error.response?.data?.message || error.message || 'حدث خطأ في تحميل بيانات المريض',
              loading: false 
            });
            return null;
          }
        },

        /**
         * Set search term
         */
        setSearchTerm: (term) => {
          set({ searchTerm: term });
        },

        /**
         * Set filter status
         */
        setFilterStatus: (status) => {
          set({ filterStatus: status });
        },

        /**
         * Set sort by
         */
        setSortBy: (sortBy) => {
          set({ sortBy });
        },

        /**
         * Select patient
         */
        selectPatient: (patient) => {
          set({ selectedPatient: patient });
        },

        /**
         * Clear selected patient
         */
        clearSelectedPatient: () => {
          set({ selectedPatient: null });
        },

        /**
         * Clear error
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Fetch patient medical record
         */
        fetchMedicalRecord: async (patientId) => {
          set({ detailsLoading: true, detailsError: null, medicalRecord: null });
          
          try {
            const response = await doctorService.getPatientMedicalRecord(patientId);
            
            if (response.isSuccess && response.data) {
              set({
                medicalRecord: response.data,
                detailsLoading: false,
              });
              return response.data;
            } else {
              set({ 
                detailsError: response.message || 'فشل في تحميل السجل الطبي',
                detailsLoading: false 
              });
              return null;
            }
          } catch (error) {
            console.error('❌ Error fetching medical record:', error);
            set({ 
              detailsError: error.response?.data?.message || error.message || 'حدث خطأ في تحميل السجل الطبي',
              detailsLoading: false 
            });
            return null;
          }
        },

        /**
         * Fetch patient session documentations
         */
        fetchSessionDocumentations: async (patientId) => {
          set({ detailsLoading: true, detailsError: null, sessionDocumentations: null });
          
          try {
            const response = await doctorService.getPatientSessionDocumentations(patientId);
            
            if (response.isSuccess && response.data) {
              set({
                sessionDocumentations: response.data,
                detailsLoading: false,
              });
              return response.data;
            } else {
              set({ 
                detailsError: response.message || 'فشل في تحميل توثيق الجلسات',
                detailsLoading: false 
              });
              return null;
            }
          } catch (error) {
            console.error('❌ Error fetching session documentations:', error);
            set({ 
              detailsError: error.response?.data?.message || error.message || 'حدث خطأ في تحميل توثيق الجلسات',
              detailsLoading: false 
            });
            return null;
          }
        },

        /**
         * Fetch patient prescriptions
         */
        fetchPrescriptions: async (patientId, doctorId) => {
          set({ detailsLoading: true, detailsError: null, prescriptions: null });
          
          try {
            console.log('📋 Fetching prescriptions for patient:', patientId, 'doctor:', doctorId);
            const response = await doctorService.getPatientPrescriptions(patientId, doctorId);
            
            console.log('📋 Prescriptions response:', response);
            console.log('📋 Response.isSuccess:', response.isSuccess);
            console.log('📋 Response.data:', response.data);
            console.log('📋 Response.data type:', typeof response.data);
            console.log('📋 Response.data is array:', Array.isArray(response.data));
            
            if (response.isSuccess && response.data) {
              console.log('✅ Setting prescriptions:', response.data);
              set({
                prescriptions: response.data,
                detailsLoading: false,
              });
              return response.data;
            } else {
              console.log('❌ Response not successful or no data');
              console.log('❌ isSuccess:', response.isSuccess);
              console.log('❌ data:', response.data);
              set({ 
                detailsError: response.message || 'فشل في تحميل الروشتات',
                detailsLoading: false 
              });
              return null;
            }
          } catch (error) {
            console.error('❌ Error fetching prescriptions:', error);
            set({ 
              detailsError: error.response?.data?.message || error.message || 'حدث خطأ في تحميل الروشتات',
              detailsLoading: false 
            });
            return null;
          }
        },

        /**
         * Fetch prescription details
         */
        fetchPrescriptionDetails: async (patientId, doctorId, prescriptionId) => {
          try {
            console.log('💊 Fetching prescription details:', { patientId, doctorId, prescriptionId });
            const response = await doctorService.getPrescriptionDetails(patientId, doctorId, prescriptionId);
            
            console.log('💊 Prescription details response:', response);
            
            if (response.isSuccess && response.data) {
              console.log('✅ Prescription details loaded:', response.data);
              return response.data;
            } else {
              console.error('❌ Failed to load prescription details');
              return null;
            }
          } catch (error) {
            console.error('❌ Error fetching prescription details:', error);
            return null;
          }
        },

        /**
         * Clear patient details
         */
        clearPatientDetails: () => {
          set({
            medicalRecord: null,
            sessionDocumentations: null,
            prescriptions: null,
            detailsError: null,
          });
        },

        /**
         * Get filtered and sorted patients
         */
        getFilteredPatients: () => {
          const { patients, searchTerm, filterStatus, sortBy } = get();
          let filtered = [...patients];

          // Search filter
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(patient => 
              patient.fullName?.toLowerCase().includes(term) ||
              patient.email?.toLowerCase().includes(term) ||
              patient.phoneNumber?.includes(term)
            );
          }

          // Status filter
          if (filterStatus === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter(p => 
              p.lastVisitDate && new Date(p.lastVisitDate) >= thirtyDaysAgo
            );
          } else if (filterStatus === 'archived') {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            filtered = filtered.filter(p => 
              p.lastVisitDate && new Date(p.lastVisitDate) < ninetyDaysAgo
            );
          }

          // Sort
          filtered.sort((a, b) => {
            if (sortBy === 'lastVisit') {
              return new Date(b.lastVisitDate || 0) - new Date(a.lastVisitDate || 0);
            }
            if (sortBy === 'name') {
              return (a.fullName || '').localeCompare(b.fullName || '', 'ar');
            }
            if (sortBy === 'sessions') {
              return (b.totalSessions || 0) - (a.totalSessions || 0);
            }
            return 0;
          });

          return filtered;
        },

        /**
         * Reset store
         */
        reset: () => {
          set({
            patients: [],
            selectedPatient: null,
            loading: false,
            error: null,
            searchTerm: '',
            filterStatus: 'all',
            sortBy: 'lastVisit',
            pagination: {
              pageNumber: 1,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
              hasPreviousPage: false,
              hasNextPage: false,
            },
            medicalRecord: null,
            sessionDocumentations: null,
            prescriptions: null,
            detailsLoading: false,
            detailsError: null,
          });
        },
      }),
      {
        name: 'patients-storage',
        partialize: (state) => ({
          // Only persist these fields
          filterStatus: state.filterStatus,
          sortBy: state.sortBy,
        }),
      }
    ),
    { name: 'PatientsStore' }
  )
);
