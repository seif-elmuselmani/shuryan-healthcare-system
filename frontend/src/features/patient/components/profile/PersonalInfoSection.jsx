import React, { useState, useEffect, useRef } from "react";
import { usePatientProfile } from "../../hooks/usePatientProfile";
import { EGYPTIAN_GOVERNORATES, GENDER_OPTIONS } from "@/utils/constants";
import MapPicker from "@/components/common/MapPicker";
import "@/styles/leaflet-custom.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaVenusMars,
  FaCalendar,
  FaGlobeAmericas,
  FaSpinner,
} from "react-icons/fa";

/**
 * Personal Info Section Component
 * 
 * Displays and manages patient personal information:
 * - First name, Last name
 * - Email, Phone
 * - Gender, Birth date
 * - Profile image
 * - Address (governorate, city, street, building, coordinates)
 * - Map integration (same as doctor clinic)
 */
const PersonalInfoSection = () => {
  const {
    personalInfo,
    address,
    error,
    success,
    updatePersonalInfo,
    updateProfileImage,
    updateAddress,
  } = usePatientProfile({ autoFetch: false }); // Fetched by parent

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '', 'saved', 'error'
  const hasInitializedInfoRef = useRef(false);
  const hasInitializedAddressRef = useRef(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const hasChangesRef = useRef(false);
  const lastSavedInfoRef = useRef(null);
  const lastSavedAddressRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Form state for personal info
  const [infoValues, setInfoValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    birthDate: '',
  });

  // Form state for address
  const [addressValues, setAddressValues] = useState({
    governorate: '',
    city: '',
    street: '',
    buildingNumber: '',
    latitude: '',
    longitude: '',
  });

  // Initialize personal info from store
  useEffect(() => {
    if (personalInfo && !hasInitializedInfoRef.current) {
      console.log('🔧 Initializing personal info from store:', personalInfo);
      const infoToUse = {
        firstName: personalInfo.firstName || '',
        lastName: personalInfo.lastName || '',
        email: personalInfo.email || '',
        phoneNumber: personalInfo.phoneNumber || '',
        gender: personalInfo.gender || '',
        birthDate: personalInfo.birthDate ? personalInfo.birthDate.split('T')[0] : '',
      };

      console.log('📝 Setting initial values:', infoToUse);
      setInfoValues(infoToUse);
      setProfileImagePreview(personalInfo.profileImageUrl || null);
      lastSavedInfoRef.current = JSON.stringify(infoToUse);
      hasInitializedInfoRef.current = true;
    }
  }, [personalInfo]);

  // Initialize address from store
  useEffect(() => {
    if (address && !hasInitializedAddressRef.current) {
      console.log('🏠 Initializing address from store:', address);
      
      // Use default Cairo coordinates if address has no coordinates
      const lat = address.latitude != null && address.latitude !== 0 ? address.latitude : 30.0444;
      const lng = address.longitude != null && address.longitude !== 0 ? address.longitude : 31.2357;
      
      const addressToUse = {
        governorate: address.governorate ? String(address.governorate) : '', // Convert number to string for form
        city: address.city || '',
        street: address.street || '',
        buildingNumber: address.buildingNumber || '',
        latitude: String(lat),
        longitude: String(lng),
      };

      console.log('📍 Setting initial address:', addressToUse);
      setAddressValues(addressToUse);
      lastSavedAddressRef.current = JSON.stringify(addressToUse);
      hasInitializedAddressRef.current = true;
    }
  }, [address]);

  // Handle personal info change
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoValues(prev => ({ ...prev, [name]: value }));
    hasChangesRef.current = true;
    setAutoSaveStatus(''); // Clear status when editing
  };

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressValues(prev => ({ ...prev, [name]: value }));
    hasChangesRef.current = true;
    setAutoSaveStatus(''); // Clear status when editing
  };

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة صالحة');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setProfileImageFile(file);

    // Create preview
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setProfileImagePreview(url);
    setProfileImageFile(file);
    hasChangesRef.current = true;
    setAutoSaveStatus(''); // Clear status when editing
  };

  // Handle map location change (from MapPicker)
  const handleMapLocationChange = (lat, lng, addressDetails) => {
    console.log('🗺️ PersonalInfoSection: Received from MapPicker:', { lat, lng, addressDetails });
    
    // Map governorate name to enum value (1-27) - matches backend exactly
    const governorateMap = {
      'القاهرة': 1, 'Cairo': 1,
      'الجيزة': 2, 'Giza': 2,
      'الإسكندرية': 3, 'Alexandria': 3,
      'الدقهلية': 4, 'Dakahlia': 4,
      'البحر الأحمر': 5, 'Red Sea': 5, 'RedSea': 5,
      'البحيرة': 6, 'Beheira': 6,
      'الفيوم': 7, 'Fayoum': 7,
      'الغربية': 8, 'Gharbia': 8,
      'الإسماعيلية': 9, 'Ismailia': 9,
      'المنوفية': 10, 'Menofia': 10, 'Monufia': 10,
      'المنيا': 11, 'Minya': 11,
      'القليوبية': 12, 'Qaliubiya': 12, 'Qalyubia': 12,
      'الوادي الجديد': 13, 'New Valley': 13, 'NewValley': 13,
      'شمال سيناء': 14, 'North Sinai': 14, 'NorthSinai': 14,
      'بورسعيد': 15, 'Port Said': 15, 'PortSaid': 15,
      'قنا': 16, 'Qena': 16,
      'الشرقية': 17, 'Sharqia': 17,
      'سوهاج': 18, 'Sohag': 18,
      'جنوب سيناء': 19, 'South Sinai': 19, 'SouthSinai': 19,
      'السويس': 20, 'Suez': 20,
      'أسوان': 21, 'Aswan': 21,
      'أسيوط': 22, 'Assiut': 22,
      'بني سويف': 23, 'Beni Suef': 23, 'BeniSuef': 23,
      'دمياط': 24, 'Damietta': 24,
      'كفر الشيخ': 25, 'Kafr El Sheikh': 25, 'KafrElSheikh': 25,
      'الأقصر': 26, 'Luxor': 26,
      'مرسى مطروح': 27, 'Matrouh': 27, 'مطروح': 27,
    };

    const governorateValue = addressDetails?.governorate 
      ? (governorateMap[addressDetails.governorate] || 1)
      : addressValues.governorate || 1;

    setAddressValues(prev => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
      // Update address fields if addressDetails provided
      ...(addressDetails && {
        governorate: String(governorateValue), // Convert to string for select input
        city: addressDetails.city || prev.city,
        street: addressDetails.street || prev.street,
      }),
    }));
    
    hasChangesRef.current = true;
    setAutoSaveStatus('');
    
    console.log('✅ PersonalInfoSection: Address updated:', {
      governorate: governorateValue,
      city: addressDetails?.city,
      street: addressDetails?.street,
    });
  };

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();

      if (data.address) {
        // Extract governorate (state/province)
        const governorateName = data.address.state || data.address.province || data.address.city || '';
        
        // Map governorate name to enum value (1-27) - matches backend exactly
        const governorateMap = {
          'القاهرة': 1, 'Cairo': 1,
          'الجيزة': 2, 'Giza': 2,
          'الإسكندرية': 3, 'Alexandria': 3,
          'الدقهلية': 4, 'Dakahlia': 4,
          'البحر الأحمر': 5, 'Red Sea': 5, 'RedSea': 5,
          'البحيرة': 6, 'Beheira': 6,
          'الفيوم': 7, 'Fayoum': 7,
          'الغربية': 8, 'Gharbia': 8,
          'الإسماعيلية': 9, 'Ismailia': 9,
          'المنوفية': 10, 'Menofia': 10, 'Monufia': 10,
          'المنيا': 11, 'Minya': 11,
          'القليوبية': 12, 'Qaliubiya': 12, 'Qalyubia': 12,
          'الوادي الجديد': 13, 'New Valley': 13, 'NewValley': 13,
          'شمال سيناء': 14, 'North Sinai': 14, 'NorthSinai': 14,
          'بورسعيد': 15, 'Port Said': 15, 'PortSaid': 15,
          'قنا': 16, 'Qena': 16,
          'الشرقية': 17, 'Sharqia': 17,
          'سوهاج': 18, 'Sohag': 18,
          'جنوب سيناء': 19, 'South Sinai': 19, 'SouthSinai': 19,
          'السويس': 20, 'Suez': 20,
          'أسوان': 21, 'Aswan': 21,
          'أسيوط': 22, 'Assiut': 22,
          'بني سويف': 23, 'Beni Suef': 23, 'BeniSuef': 23,
          'دمياط': 24, 'Damietta': 24,
          'كفر الشيخ': 25, 'Kafr El Sheikh': 25, 'KafrElSheikh': 25,
          'الأقصر': 26, 'Luxor': 26,
          'مرسى مطروح': 27, 'Matrouh': 27, 'مطروح': 27,
        };

        const governorateValue = governorateMap[governorateName] || 1;
        const city = data.address.city || data.address.town || data.address.village || '';
        const street = data.address.road || data.address.street || '';

        return {
          governorate: governorateValue,
          city,
          street,
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching address from coordinates:', error);
      return null;
    }
  };

  // Get current location with auto-fill
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('📍 Current location:', { lat, lng });

        // Get address from coordinates
        const addressData = await getAddressFromCoordinates(lat, lng);
        console.log('🗺️ Address data from reverse geocoding:', addressData);

        setAddressValues((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
          ...(addressData && {
            governorate: String(addressData.governorate),
            city: addressData.city,
            street: addressData.street,
          }),
        }));

        hasChangesRef.current = true;
        setAutoSaveStatus('');
        setGettingLocation(false);
      },
      (error) => {
        console.error('❌ Error getting location:', error);
        alert('فشل الحصول على الموقع الحالي. تأكد من السماح بالوصول للموقع.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Auto-save function
  const performAutoSave = async () => {
    try {
      // Check if there are changes
      const currentInfo = JSON.stringify(infoValues);
      const currentAddress = JSON.stringify(addressValues);
      
      const hasInfoChanges = currentInfo !== lastSavedInfoRef.current;
      const hasAddressChanges = currentAddress !== lastSavedAddressRef.current;
      const hasImageChanges = !!profileImageFile;
      
      console.log('📊 Change detection:', {
        hasInfoChanges,
        hasAddressChanges,
        hasImageChanges,
        currentInfo: currentInfo.substring(0, 100) + '...',
        lastSavedInfo: lastSavedInfoRef.current?.substring(0, 100) + '...',
      });
    
    if (!hasInfoChanges && !hasAddressChanges && !hasImageChanges) {
      console.log('⏭️ No changes to save, skipping...');
      hasChangesRef.current = false;
      return; // No changes to save
    }
    
    console.log('🔄 Auto-saving changes...');
    // Don't show "saving" status, just save silently
    
    // Basic validation
    if (!infoValues.firstName || !infoValues.lastName || !infoValues.phoneNumber) {
      console.error('❌ Validation failed: Required fields are empty', {
        firstName: infoValues.firstName,
        lastName: infoValues.lastName,
        phoneNumber: infoValues.phoneNumber,
        hasFirstName: !!infoValues.firstName,
        hasLastName: !!infoValues.lastName,
        hasPhoneNumber: !!infoValues.phoneNumber
      });
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(''), 3000);
      return; // Don't auto-save if required fields are empty
    }
    
    console.log('✅ Validation passed!');

    // Prepare info data
    const infoData = {
      firstName: infoValues.firstName.trim(),
      lastName: infoValues.lastName.trim(),
      email: infoValues.email?.trim() || '',
      phoneNumber: infoValues.phoneNumber.trim(),
      gender: infoValues.gender ? parseInt(infoValues.gender, 10) : null, // Convert to number (1 or 2)
      birthDate: infoValues.birthDate || null,
    };

    // Prepare address data
    const lat = parseFloat(addressValues.latitude);
    const lng = parseFloat(addressValues.longitude);
    
    // Convert governorate from string to number (Backend expects enum 1-27)
    const governorateNum = addressValues.governorate ? parseInt(addressValues.governorate, 10) : null;
    
    const addressData = {
      street: addressValues.street?.trim() || '',
      city: addressValues.city?.trim() || '',
      governorate: governorateNum, // Number (enum)
      buildingNumber: addressValues.buildingNumber?.trim() || '',
      latitude: !isNaN(lat) && lat !== 0 ? lat : 30.0444, // Default Cairo coordinates
      longitude: !isNaN(lng) && lng !== 0 ? lng : 31.2357,
    };
    
    console.log('🗺️ Address coordinates:', {
      original: { lat: addressValues.latitude, lng: addressValues.longitude },
      parsed: { lat, lng },
      final: { lat: addressData.latitude, lng: addressData.longitude }
    });

    console.log('📤 Data to send:', { 
      infoData, 
      addressData, 
      hasImage: !!profileImageFile,
      imageFileName: profileImageFile?.name,
      governorateType: typeof addressData.governorate,
      governorateValue: addressData.governorate
    });

    // Execute all updates in parallel
    // Personal info, profile image, and address as separate requests
    const promises = [];
    const promiseTypes = []; // Track which API each promise represents
    
    // Update personal info if it changed
    if (hasInfoChanges) {
      promises.push(updatePersonalInfo(infoData));
      promiseTypes.push('Personal Info');
    }
    
    // Update profile image if changed (separate endpoint)
    if (hasImageChanges && profileImageFile) {
      promises.push(updateProfileImage(profileImageFile));
      promiseTypes.push('Profile Image');
    }
    
    // Update address if it changed and has valid data
    if (hasAddressChanges) {
      // Validate address has at least governorate AND city (Backend requirement)
      if (addressData.governorate && addressData.city) {
        promises.push(updateAddress(addressData));
        promiseTypes.push('Address');
      } else {
        console.warn('⚠️ Skipping address update - governorate and city are required', {
          governorate: addressData.governorate,
          city: addressData.city
        });
      }
    }
    
    // If no promises, skip (shouldn't happen due to earlier check)
    if (promises.length === 0) {
      console.log('⚠️ No updates to perform');
      setAutoSaveStatus('');
      return;
    }

    const results = await Promise.allSettled(promises);
    console.log('📥 Save results:', results);
    console.log('📋 Promise types:', promiseTypes);
    console.log('🔢 Number of promises:', promises.length);
    console.log('🔢 Number of results:', results.length);

    // Check if all succeeded
    console.log('🔍 Starting success check...');
    const allSuccess = results.every((r, index) => {
      const apiName = promiseTypes[index] || `API ${index}`;
      
      console.log(`🔍 Checking ${apiName} result:`, {
        status: r.status,
        value: r.value,
        isSuccess: r.value?.isSuccess,
        hasIsSuccess: 'isSuccess' in (r.value || {}),
        valueType: typeof r.value,
        valueKeys: r.value ? Object.keys(r.value) : null,
        valueKeysLength: r.value ? Object.keys(r.value).length : null
      });
      
      if (r.status !== 'fulfilled') {
        console.error(`❌ ${apiName}: Request failed (rejected)`);
        return false;
      }
      
      // If value is empty object {}, consider it success (Backend issue)
      const isEmptyObject = r.value && typeof r.value === 'object' && Object.keys(r.value).length === 0;
      console.log(`🧪 ${apiName}: isEmptyObject check:`, {
        hasValue: !!r.value,
        isObject: typeof r.value === 'object',
        keysLength: r.value ? Object.keys(r.value).length : null,
        isEmptyObject
      });
      
      if (isEmptyObject) {
        console.log(`⚠️ ${apiName}: Backend returned empty response {}, considering it success`);
        return true;
      }
      
      // If value is null or undefined but status is fulfilled, consider it success
      if (!r.value) {
        console.log(`⚠️ ${apiName}: Backend returned null/undefined, considering it success`);
        return true;
      }
      
      // Check isSuccess
      const hasIsSuccess = r.value?.isSuccess === true;
      
      // WORKAROUND: If Backend returns empty object or no isSuccess field,
      // but status is fulfilled (200 OK), consider it success
      const success = hasIsSuccess || (r.status === 'fulfilled' && !('isSuccess' in (r.value || {})));
      
      if (!hasIsSuccess && success) {
        console.warn(`⚠️ ${apiName}: No isSuccess field, but status is fulfilled - considering it success`);
      } else if (!success) {
        console.error(`❌ ${apiName}: isSuccess = ${r.value?.isSuccess}`);
      } else {
        console.log(`✅ ${apiName}: Success!`);
      }
      
      return success;
    });
    
    console.log('🎯 Final result: allSuccess =', allSuccess);

    if (allSuccess) {
      // Update last saved refs (no refresh to avoid loading)
      lastSavedInfoRef.current = currentInfo;
      lastSavedAddressRef.current = currentAddress;
      setProfileImageFile(null);
      hasChangesRef.current = false;
      setAutoSaveStatus('saved');
      console.log('✅ Auto-save complete!');
      
      // Clear saved status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('');
      }, 2000);
    } else {
      console.error('⚠️ Auto-save failed:', results);
      // Log detailed error information
      results.forEach((result, index) => {
        const name = promiseTypes[index] || `API ${index}`;
        console.log(`${name} result:`, {
          status: result.status,
          value: result.value,
          reason: result.reason
        });
      });
      setAutoSaveStatus('error');
      // Clear error status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('');
      }, 3000);
    }
    } catch (error) {
      console.error('🚨 Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => {
        setAutoSaveStatus('');
      }, 3000);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (hasChangesRef.current) {
      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for 3 seconds
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, 3000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [infoValues, addressValues, profileImageFile]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FaUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">المعلومات الشخصية</h3>
              <p className="text-teal-100">
                البيانات الأساسية ومعلومات التواصل
              </p>
            </div>
          </div>
          {/* Auto-save indicator */}
          {autoSaveStatus && (
            <div className={`px-4 py-2 backdrop-blur-sm rounded-lg transition-all ${
              autoSaveStatus === 'saved' ? 'bg-green-500/30 text-green-100' :
              autoSaveStatus === 'error' ? 'bg-red-500/20 text-red-100' :
              'bg-white/20 text-white'
            }`}>
              <span className="text-sm font-medium">
                {autoSaveStatus === 'saved' ? 'تم الحفظ' :
                 autoSaveStatus === 'error' ? 'فشل الحفظ' :
                 ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 shadow-lg">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-teal-600" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all">
              <FaCamera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            اضغط على الكاميرا لتغيير الصورة
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaUser className="w-5 h-5 text-teal-600" />
            <h4 className="text-lg font-semibold text-slate-800">المعلومات الأساسية</h4>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الاسم الأول <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={infoValues.firstName}
                onChange={handleInfoChange}
                placeholder="أدخل الاسم الأول"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الاسم الثاني <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={infoValues.lastName}
                onChange={handleInfoChange}
                placeholder="أدخل الاسم الثاني"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-right"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FaEnvelope className="inline w-4 h-4 ml-1 text-teal-600" />
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={infoValues.email}
                onChange={handleInfoChange}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FaPhone className="inline w-4 h-4 ml-1 text-teal-600" />
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={infoValues.phoneNumber}
                onChange={handleInfoChange}
                placeholder="01xxxxxxxxx"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Gender & Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FaVenusMars className="inline w-4 h-4 ml-1 text-teal-600" />
                الجنس <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={infoValues.gender}
                onChange={handleInfoChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-right"
              >
                <option value="">اختر الجنس</option>
                {GENDER_OPTIONS.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FaCalendar className="inline w-4 h-4 ml-1 text-teal-600" />
                تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={infoValues.birthDate}
                onChange={handleInfoChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-left"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-semibold text-slate-800">العنوان</h4>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-6">
            <p className="text-sm text-teal-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-teal-500" />
              اضغط على زر "تحديد موقعي الحالي" لتحديد موقعك وملء بيانات العنوان تلقائياً
            </p>
          </div>

          {/* Governorate & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                المحافظة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={
                  addressValues.governorate
                    ? EGYPTIAN_GOVERNORATES.find(g => g.id === parseInt(addressValues.governorate))?.label || 'سيتم ملؤها تلقائياً'
                    : 'سيتم ملؤها تلقائياً'
                }
                disabled
                placeholder="سيتم ملؤها تلقائياً"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                المدينة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={addressValues.city}
                onChange={handleAddressChange}
                disabled
                placeholder="سيتم ملؤها تلقائياً"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-right"
              />
            </div>
          </div>

          {/* Street & Building Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الشارع <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                value={addressValues.street}
                onChange={handleAddressChange}
                disabled
                placeholder="سيتم ملؤها تلقائياً"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-right"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رقم المبنى
              </label>
              <input
                type="text"
                name="buildingNumber"
                value={addressValues.buildingNumber}
                onChange={handleAddressChange}
                placeholder="رقم المبنى"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-right"
              />
            </div>
          </div>

          {/* Coordinates & Get Location Button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                خط العرض (Latitude)
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={addressValues.latitude}
                onChange={handleAddressChange}
                placeholder="30.0444"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                خط الطول (Longitude)
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={addressValues.longitude}
                onChange={handleAddressChange}
                placeholder="31.2357"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-right"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gettingLocation ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    جاري التحديد...
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="w-4 h-4" />
                    تحديد موقعي الحالي
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaGlobeAmericas className="w-4 h-4 text-green-600" />
                <h5 className="font-medium text-slate-800">الموقع على الخريطة</h5>
              </div>
            </div>

            <MapPicker
              latitude={parseFloat(addressValues.latitude) || 30.0444}
              longitude={parseFloat(addressValues.longitude) || 31.2357}
              onLocationChange={handleMapLocationChange}
              disabled={false}
            />
          </div>
        </div>

        {/* Success Message */}
        {(success.personalInfo || success.address || success.profileImage) && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              تم حفظ التغييرات بنجاح!
            </p>
          </div>
        )}

        {/* Error Message */}
        {(error.personalInfo || error.address || error.profileImage) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              حدث خطأ أثناء الحفظ: {error.personalInfo || error.address || error.profileImage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
