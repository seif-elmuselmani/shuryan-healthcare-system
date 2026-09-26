import { create } from "zustand";
import { devtools } from "zustand/middleware";
import patientService from "@/api/services/patient.service";

/**
 * Lab Prescriptions Store
 * Manages patient's lab prescriptions (طلبات التحاليل)
 */
const useLabPrescriptionsStore = create(
  devtools(
    (set) => ({
      // State
      labPrescriptions: [],
      selectedPrescription: null,
      loading: false,
      error: null,

      // Actions
      fetchLabPrescriptions: async () => {
        set({ loading: true, error: null });
        try {
          const prescriptions = await patientService.getLabPrescriptions();
          set({ labPrescriptions: prescriptions, loading: false });
          console.log('📦 Lab prescriptions loaded:', prescriptions.length);
        } catch (error) {
          set({ error: error.message, loading: false });
          console.error('❌ Failed to fetch lab prescriptions:', error);
        }
      },

      selectPrescription: (prescription) => {
        set({ selectedPrescription: prescription });
      },

      clearSelection: () => {
        set({ selectedPrescription: null });
      },

      reset: () => {
        set({
          labPrescriptions: [],
          selectedPrescription: null,
          loading: false,
          error: null,
        });
      },
    }),
    { name: 'LabPrescriptionsStore' }
  )
);

export default useLabPrescriptionsStore;
