import { create } from "zustand";
import { devtools } from "zustand/middleware";
import pharmacyService from "../../../api/services/pharmacy.service";

/**
 * Pharmacy Statistics Store
 * Manages pharmacy statistics data
 */
const usePharmacyStatsStore = create(
    devtools(
        (set, get) => ({
            // ==========================================
            // State
            // ==========================================
            statistics: null,
            loading: false,
            error: null,

            // ==========================================
            // Actions
            // ==========================================

            /**
             * Fetch pharmacy statistics
             * @returns {Promise<Object>} Result with success status
             */
            fetchStatistics: async () => {
                console.log('📊 [PharmacyStatsStore] Fetching statistics...');

                set({ loading: true, error: null });

                try {
                    const data = await pharmacyService.getStatistics();

                    console.log('✅ [PharmacyStatsStore] Statistics fetched:', data);

                    set({
                        statistics: data,
                        loading: false,
                        error: null,
                    });

                    return { success: true, data };
                } catch (error) {
                    console.error('❌ [PharmacyStatsStore] Error fetching statistics:', error);

                    const errorMessage = error.response?.data?.message || 'فشل في جلب الإحصائيات';

                    set({
                        statistics: null,
                        loading: false,
                        error: errorMessage,
                    });

                    return { success: false, error: errorMessage };
                }
            },

            /**
             * Clear statistics data
             */
            clearStatistics: () => {
                console.log('🧹 [PharmacyStatsStore] Clearing statistics data');
                set({
                    statistics: null,
                    loading: false,
                    error: null,
                });
            },

            /**
             * Clear error
             */
            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'pharmacy-stats-store',
            partialize: (state) => ({
                // Don't persist loading states or errors
                statistics: state.statistics,
            }),
        }
    )
);

export default usePharmacyStatsStore;
