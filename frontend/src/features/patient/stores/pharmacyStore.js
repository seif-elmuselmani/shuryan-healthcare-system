import { create } from "zustand";
import { devtools } from "zustand/middleware";
import patientService from "../../../api/services/patient.service";

/**
 * Pharmacy Store
 * Manages nearby pharmacies data and operations
 */
const usePharmacyStore = create(
  devtools(
    (set) => ({
      // ==========================================
      // State
      // ==========================================
      nearbyPharmacies: [],
      loading: false,
      error: null,

      // ==========================================
      // Actions
      // ==========================================

      /**
       * Fetch nearby pharmacies (closest 3)
       */
      fetchNearbyPharmacies: async () => {
        console.log('🏪 [PharmacyStore] Fetching nearby pharmacies...');
        
        set({ loading: true, error: null });
        
        try {
          const pharmacies = await patientService.getNearbyPharmacies();
          
          console.log('✅ [PharmacyStore] Nearby pharmacies fetched:', pharmacies);
          console.log('✅ [PharmacyStore] Type check - is array:', Array.isArray(pharmacies));
          
          // Ensure we always have an array
          const safePharmacies = Array.isArray(pharmacies) ? pharmacies : [];
          
          set({
            nearbyPharmacies: safePharmacies,
            loading: false,
            error: null,
          });
          
          return { success: true, data: safePharmacies };
        } catch (error) {
          console.error('❌ [PharmacyStore] Error fetching pharmacies:', error);
          
          const errorMessage = error.response?.data?.message || 'فشل في جلب الصيدليات القريبة';
          
          set({
            nearbyPharmacies: [],
            loading: false,
            error: errorMessage,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Clear pharmacies data
       */
      clearPharmacies: () => {
        console.log('🧹 [PharmacyStore] Clearing pharmacies data');
        set({
          nearbyPharmacies: [],
          loading: false,
          error: null,
        });
      },

      /**
       * Send prescription to pharmacy
       * @param {string} prescriptionId - Prescription ID
       * @param {string} pharmacyId - Pharmacy ID
       */
      sendPrescriptionToPharmacy: async (prescriptionId, pharmacyId) => {
        console.log(`📤 [PharmacyStore] Sending prescription ${prescriptionId} to pharmacy ${pharmacyId}...`);
        
        try {
          const result = await patientService.sendPrescriptionToPharmacy(prescriptionId, pharmacyId);
          
          console.log('✅ [PharmacyStore] Prescription sent successfully:', result);
          
          return { success: true, data: result };
        } catch (error) {
          console.error('❌ [PharmacyStore] Error sending prescription:', error);
          
          const errorMessage = error.response?.data?.message || 'فشل في إرسال الروشتة';
          
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'pharmacy-store',
      partialize: (state) => ({
        // Don't persist loading states or errors
        nearbyPharmacies: state.nearbyPharmacies,
      }),
    }
  )
);

export default usePharmacyStore;
