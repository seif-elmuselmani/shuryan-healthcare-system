import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import doctorService from "@/api/services/doctor.service";

/**
 * Clinic Store - Manages clinic information
 * 
 * Features:
 * - Clinic info (name, phones, services)
 * - Clinic address (governorate, city, street, etc.)
 * - Clinic images (up to 6 images)
 * - Parallel data fetching with Promise.allSettled
 * - Optimistic updates with rollback on error
 */
export const useClinicStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==================== State ====================
        
        // Clinic Info
        clinicInfo: {
          clinicName: '',
          phoneNumbers: [], // Array of {number: string, type: number}
          services: [],
        },
        
        // Clinic Address
        clinicAddress: {
          governorate: '',
          city: '',
          street: '',
          buildingNumber: '',
          latitude: null,
          longitude: null,
        },
        
        // Clinic Images
        clinicImages: [],
        
        // Loading States
        loading: {
          info: false,
          address: false,
          images: false,
          uploading: false,
          deleting: false,
          reordering: false,
        },
        
        // Error States
        error: {
          info: null,
          address: null,
          images: null,
        },
        
        // Success Messages
        success: {
          info: null,
          address: null,
          images: null,
        },

        // ==================== Actions ====================
        
        /**
         * Fetch clinic info
         */
        fetchClinicInfo: async () => {
          set((state) => ({
            loading: { ...state.loading, info: true },
            error: { ...state.error, info: null },
          }));

          try {
            const response = await doctorService.getClinicInfo();
            const data = response.data || response;

            set({
              clinicInfo: {
                clinicName: data.clinicName || '',
                phoneNumbers: data.phoneNumbers || [],
                services: data.services || [],
              },
              loading: { ...get().loading, info: false },
            });
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, info: false },
              error: { ...state.error, info: error.response?.data?.message || 'فشل تحميل معلومات العيادة' },
            }));
            throw error;
          }
        },

        /**
         * Update clinic info
         * @param {Object} data - Clinic info data
         */
        updateClinicInfo: async (data) => {
          const previousInfo = get().clinicInfo;

          // Optimistic update
          set((state) => ({
            clinicInfo: { ...state.clinicInfo, ...data },
            loading: { ...state.loading, info: true },
            error: { ...state.error, info: null },
            success: { ...state.success, info: null },
          }));

          try {
            await doctorService.updateClinicInfo(data);

            set((state) => ({
              loading: { ...state.loading, info: false },
              success: { ...state.success, info: 'تم حفظ معلومات العيادة بنجاح' },
            }));

            // Auto-clear success message
            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, info: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            // Rollback
            set((state) => ({
              clinicInfo: previousInfo,
              loading: { ...state.loading, info: false },
              error: { ...state.error, info: error.response?.data?.message || 'فشل حفظ معلومات العيادة' },
            }));
            return { success: false, error };
          }
        },

        /**
         * Fetch clinic address
         */
        fetchClinicAddress: async () => {
          set((state) => ({
            loading: { ...state.loading, address: true },
            error: { ...state.error, address: null },
          }));

          try {
            const response = await doctorService.getClinicAddress();
            console.log('🔍 Store: Fetch response:', response);
            console.log('🔍 Store: Response keys:', Object.keys(response));
            console.log('🔍 Store: Response.data:', response.data);
            console.log('🔍 Store: Response.data type:', typeof response.data);
            
            // Backend returns: { isSuccess, message, data: {...}, errors, statusCode }
            // apiClient.get already extracts response.data
            // So response = { isSuccess, message, data: {...} }
            
            // Check if response.data exists and has data property
            console.log('🔍 Store: response.data exists?', !!response.data);
            console.log('🔍 Store: response.data is object?', typeof response.data === 'object');
            
            const addressData = response.data || response;
            console.log('📦 Store: Address data:', addressData);
            console.log('📦 Store: Address data keys:', Object.keys(addressData));
            console.log('📦 Store: Address data.latitude:', addressData.latitude);
            console.log('📦 Store: Address data.longitude:', addressData.longitude);
            console.log('📦 Store: Governorate value:', addressData.governorate, 'Type:', typeof addressData.governorate);
            console.log('📍 Store: Coordinates from addressData:', {
              latitude: addressData.latitude,
              longitude: addressData.longitude,
              latType: typeof addressData.latitude,
              lngType: typeof addressData.longitude,
              latValue: addressData.latitude,
              lngValue: addressData.longitude,
              latIsNull: addressData.latitude === null,
              lngIsNull: addressData.longitude === null,
              latIsUndefined: addressData.latitude === undefined,
              lngIsUndefined: addressData.longitude === undefined
            });

            const finalAddress = {
              governorate: addressData.governorate || '',
              city: addressData.city || '',
              street: addressData.street || '',
              buildingNumber: addressData.buildingNumber || '',
              latitude: addressData.latitude ?? null,  // Use ?? to preserve 0
              longitude: addressData.longitude ?? null,
            };
            
            console.log('💾 Store: Setting clinicAddress to:', finalAddress);
            console.log('💾 Store: Final latitude:', finalAddress.latitude, 'Type:', typeof finalAddress.latitude);
            console.log('💾 Store: Final longitude:', finalAddress.longitude, 'Type:', typeof finalAddress.longitude);
            
            set({
              clinicAddress: finalAddress,
              loading: { ...get().loading, address: false },
            });
            
            console.log('✅ Store: Updated! Verifying store state...');
            const storeState = get().clinicAddress;
            console.log('✅ Store: Current clinicAddress in store:', storeState);
            console.log('✅ Store: Store latitude:', storeState.latitude, 'Type:', typeof storeState.latitude);
            console.log('✅ Store: Store longitude:', storeState.longitude, 'Type:', typeof storeState.longitude);
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, address: false },
              error: { ...state.error, address: error.response?.data?.message || 'فشل تحميل عنوان العيادة' },
            }));
            throw error;
          }
        },

        /**
         * Update clinic address
         * @param {Object} data - Address data
         */
        updateClinicAddress: async (data) => {
          const previousAddress = get().clinicAddress;

          // Optimistic update
          set((state) => ({
            clinicAddress: { ...state.clinicAddress, ...data },
            loading: { ...state.loading, address: true },
            error: { ...state.error, address: null },
            success: { ...state.success, address: null },
          }));

          try {
            console.log('🔵 Store: Calling API with data:', data);
            const response = await doctorService.updateClinicAddress(data);
            console.log('✅ Store: API response:', response);

            // Re-fetch to get the saved data from backend
            console.log('🔄 Re-fetching address from backend...');
            const fetchResponse = await doctorService.getClinicAddress();
            console.log('🔍 Re-fetch response:', fetchResponse);
            
            // Backend returns: { isSuccess, message, data: {...}, errors, statusCode }
            const savedData = fetchResponse.data || fetchResponse;
            console.log('✅ Fetched saved data:', savedData);

            set((state) => ({
              clinicAddress: {
                governorate: savedData.governorate || '',
                city: savedData.city || '',
                street: savedData.street || '',
                buildingNumber: savedData.buildingNumber || '',
                latitude: savedData.latitude ?? null,  // Use ?? to preserve 0
                longitude: savedData.longitude ?? null,
              },
              loading: { ...state.loading, address: false },
              success: { ...state.success, address: 'تم حفظ عنوان العيادة بنجاح' },
            }));

            // Auto-clear success message
            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, address: null },
              }));
            }, 3000);

            return { success: true, data: savedData };
          } catch (error) {
            console.error('❌ Store: Save failed:', error.response?.data);
            // Rollback
            set((state) => ({
              clinicAddress: previousAddress,
              loading: { ...state.loading, address: false },
              error: { ...state.error, address: error.response?.data?.message || 'فشل حفظ عنوان العيادة' },
            }));
            return { success: false, error };
          }
        },

        /**
         * Fetch clinic images
         */
        fetchClinicImages: async () => {
          console.log('🏪 Store: Fetching clinic images...');
          
          set((state) => ({
            loading: { ...state.loading, images: true },
            error: { ...state.error, images: null },
          }));

          try {
            const response = await doctorService.getClinicImages();
            console.log('🏪 Store: Fetch response:', response);
            
            const data = response.data || response;
            const images = data.images || data || [];
            
            console.log('🏪 Store: Parsed images:', images);
            console.log('🏪 Store: Images count:', images.length);

            set({
              clinicImages: images,
              loading: { ...get().loading, images: false },
            });
          } catch (error) {
            console.error('🏪 Store: Fetch failed:', error);
            set((state) => ({
              loading: { ...state.loading, images: false },
              error: { ...state.error, images: error.response?.data?.message || 'فشل تحميل صور العيادة' },
            }));
            throw error;
          }
        },

        /**
         * Upload clinic image
         * @param {File} file - Image file
         * @param {number} order - Image order
         */
        uploadClinicImage: async (file, order) => {
          console.log('🏪 Store: Uploading image with order:', order);
          
          set((state) => ({
            loading: { ...state.loading, uploading: true },
            error: { ...state.error, images: null },
          }));

          try {
            const response = await doctorService.uploadClinicImage(file, order);
            const image = response.data || response;
            
            console.log('🏪 Store: Image uploaded successfully. Response:', image);
            console.log('🏪 Store: Current clinicImages count:', get().clinicImages.length);

            set((state) => ({
              clinicImages: [...state.clinicImages, image],
              loading: { ...state.loading, uploading: false },
              success: { ...state.success, images: 'تم رفع الصورة بنجاح' },
            }));
            
            console.log('🏪 Store: New clinicImages count:', get().clinicImages.length);

            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, images: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            console.error('🏪 Store: Upload failed:', error);
            set((state) => ({
              loading: { ...state.loading, uploading: false },
              error: { ...state.error, images: error.response?.data?.message || 'فشل رفع الصورة' },
            }));
            return { success: false, error };
          }
        },

        /**
         * Delete clinic image
         * @param {string} imageId - Image ID
         */
        deleteClinicImage: async (imageId) => {
          const previousImages = get().clinicImages;

          // Optimistic update
          set((state) => ({
            clinicImages: state.clinicImages.filter(img => img.id !== imageId),
            loading: { ...state.loading, deleting: true },
            error: { ...state.error, images: null },
          }));

          try {
            await doctorService.deleteClinicImage(imageId);

            set((state) => ({
              loading: { ...state.loading, deleting: false },
              success: { ...state.success, images: 'تم حذف الصورة بنجاح' },
            }));

            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, images: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            // Rollback
            set((state) => ({
              clinicImages: previousImages,
              loading: { ...state.loading, deleting: false },
              error: { ...state.error, images: error.response?.data?.message || 'فشل حذف الصورة' },
            }));
            return { success: false, error };
          }
        },

        /**
         * Reorder clinic images
         * @param {Array} images - New order of images
         */
        reorderClinicImages: async (images) => {
          const previousImages = get().clinicImages;

          // Optimistic update
          set((state) => ({
            clinicImages: images,
            loading: { ...state.loading, reordering: true },
            error: { ...state.error, images: null },
          }));

          try {
            await doctorService.reorderClinicImages(images);

            set((state) => ({
              loading: { ...state.loading, reordering: false },
              success: { ...state.success, images: 'تم إعادة ترتيب الصور بنجاح' },
            }));

            setTimeout(() => {
              set((state) => ({
                success: { ...state.success, images: null },
              }));
            }, 3000);

            return { success: true };
          } catch (error) {
            // Rollback
            set((state) => ({
              clinicImages: previousImages,
              loading: { ...state.loading, reordering: false },
              error: { ...state.error, images: error.response?.data?.message || 'فشل إعادة ترتيب الصور' },
            }));
            return { success: false, error };
          }
        },

        /**
         * Fetch all clinic data in parallel
         */
        fetchAllClinicData: async () => {
          const results = await Promise.allSettled([
            get().fetchClinicInfo(),
            get().fetchClinicAddress(),
            get().fetchClinicImages(),
          ]);

          // Check for errors
          const errors = results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason?.message || 'خطأ غير معروف');

          if (errors.length > 0) {
            console.error('Errors fetching clinic data:', errors);
          }
        },

        /**
         * Clear errors
         */
        clearErrors: () => {
          set({
            error: {
              info: null,
              address: null,
              images: null,
            },
          });
        },

        /**
         * Clear success messages
         */
        clearSuccess: () => {
          set({
            success: {
              info: null,
              address: null,
              images: null,
            },
          });
        },

        /**
         * Reset clinic store
         */
        resetClinicStore: () => {
          set({
            clinicInfo: {
              clinicName: '',
              phoneNumbers: [],
              services: [],
            },
            clinicAddress: {
              governorate: '',
              city: '',
              street: '',
              buildingNumber: '',
              latitude: null,
              longitude: null,
            },
            clinicImages: [],
            loading: {
              info: false,
              address: false,
              images: false,
              uploading: false,
              deleting: false,
              reordering: false,
            },
            error: {
              info: null,
              address: null,
              images: null,
            },
            success: {
              info: null,
              address: null,
              images: null,
            },
          });
        },
      }),
      {
        name: 'clinic-storage',
        partialize: (state) => ({
          clinicInfo: state.clinicInfo,
          clinicAddress: state.clinicAddress,
        }),
      }
    ),
    { name: 'ClinicStore' }
  )
);
