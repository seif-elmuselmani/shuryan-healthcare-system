import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth';
import doctorService from '@/api/services/doctor.service';
import ProfileSidebar from '../components/ProfileSidebar';
import PersonalInfoSection from '../components/PersonalInfoSection.jsx';
import ProfessionalInfoSection from '../components/ProfessionalInfoSection';
import ClinicInfoSection from '../components/ClinicInfoSection';
import ServicesSection from '../components/ServicesSection';
import AppointmentSection from '../components/AppointmentSection';
import PartnerSection from '../components/PartnerSection';
import { 
  mapGenderToArabic, 
  mapGenderToNumber, 
  SPECIALTIES,
  getDocumentTypeFromFieldName 
} from '@/utils/constants';
import { DOCUMENT_STATUS, DOCUMENT_STATUS_LABELS } from '@/features/verifier/constants/verifierConstants';

// Utility functions
const formatDateFromISO = (isoDate) => {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
};

const DoctorProfilePage = () => {
  const { user } = useAuthStore();
  
  // Active section state
  const [activeSection, setActiveSection] = useState('personal');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  
  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '', 'pending', 'saving', 'saved', 'error'
  const hasChangesRef = useRef(false);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  
  // Document statuses state
  const [documentStatuses, setDocumentStatuses] = useState({
    nationalId: null,
    medicalLicense: null,
    syndicateMembership: null,
    graduationCertificate: null,
    specializationCertificate: null,
  });
  
  // Form data state
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    profilePicture: null,
    profilePictureUrl: user?.profileImageUrl || null,
    
    // Professional Info
    specialty: user?.specialty || '',
    experience: user?.experience || '',
    education: user?.education || '',
    professionalMemberships: user?.professionalMemberships || '',
    
    // Professional Documents
    nationalIdPhoto: null,
    nationalIdPreview: null,
    medicalLicensePhoto: null,
    medicalLicensePreview: null,
    syndicateMembershipPhoto: null,
    syndicateMembershipPreview: null,
    graduationCertificatePhoto: null,
    graduationCertificatePreview: null,
    specializationCertificatePhoto: null,
    specializationCertificatePreview: null,
    
    // Additional Documents
    awardsImages: [],
    researchPapersImages: [],
    
    // Clinic Info (للمستقبل)
    clinicName: user?.clinicName || '',
    clinicAddress: user?.clinicAddress || '',
    
    // Services (للمستقبل)
    consultationFee: user?.consultationFee || '',
    
    // Appointment Settings (للمستقبل)
    appointmentDuration: user?.appointmentDuration || '30',
  });
  
  // Profile image preview
  const [profileImagePreview, setProfileImagePreview] = useState(
    user?.profilePicture || null
  );
  
  // Track profile image file separately for auto-save
  const profileImageFileRef = useRef(null);
  
  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await doctorService.getProfile();
      const profileData = response.data || response;
      
      const formattedDate = formatDateFromISO(profileData.dateOfBirth);
      const genderInArabic = mapGenderToArabic(profileData.genderName);
      
      setFormData(prev => ({
        ...prev,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        dateOfBirth: formattedDate,
        gender: genderInArabic,
        bio: profileData.biography || '',
        profilePictureUrl: profileData.profilePictureUrl || null,
      }));
      
      if (profileData.profilePictureUrl) {
        setProfileImagePreview(profileData.profilePictureUrl);
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'فشل تحميل البيانات';
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch specialty and experience data
  const fetchSpecialtyExperience = useCallback(async () => {
    try {
      const response = await doctorService.getSpecialtyExperience();
      const data = response.data || response;
      
      console.log('Fetched specialty and experience:', data);
      
      // Map medicalSpecialty enum to specialty name
      const specialtyName = SPECIALTIES.find(s => s.id === data.medicalSpecialty)?.name || '';
      
      setFormData(prev => ({
        ...prev,
        specialty: specialtyName,
        experience: data.yearsOfExperience?.toString() || '',
      }));
      
    } catch (error) {
      console.error('Failed to fetch specialty and experience:', error);
    }
  }, []);

  // Fetch professional documents
  const fetchProfessionalDocuments = useCallback(async () => {
    try {
      // Fetch all document types in parallel
      const [requiredDocs, researchDocs, awardDocs] = await Promise.allSettled([
        doctorService.getRequiredDocuments(),
        doctorService.getResearchDocuments(),
        doctorService.getAwardDocuments(),
      ]);

      // Process required documents
      if (requiredDocs.status === 'fulfilled') {
        const docs = requiredDocs.value.data || requiredDocs.value;
        
        console.log('📄 [Fetch Documents] Raw response:', requiredDocs.value);
        console.log('📄 [Fetch Documents] Extracted docs array:', docs);
        
        // Map documents to form data based on document type
        if (Array.isArray(docs)) {
          const newStatuses = {};
          
          docs.forEach(doc => {
            console.log('📄 [Document] Processing:', {
              type: doc.type,
              typeName: doc.typeName,
              status: doc.status,
              statusName: doc.statusName,
              statusType: typeof doc.status,
            });
            
            // Determine status based on status from API
            // Backend Enum: 0=Draft, 1=UnderReview, 2=Approved, 3=Rejected, 4=Expired
            let displayStatus = DOCUMENT_STATUS.NOT_SUBMITTED;
            
            if (doc.status === 0) displayStatus = DOCUMENT_STATUS.NOT_SUBMITTED;      // 0 = Draft (مسودة)
            else if (doc.status === 1) displayStatus = DOCUMENT_STATUS.PENDING;       // 1 = UnderReview (تحت المراجعة)
            else if (doc.status === 2) displayStatus = DOCUMENT_STATUS.APPROVED;      // 2 = Approved (مقبول)
            else if (doc.status === 3) displayStatus = DOCUMENT_STATUS.REJECTED;      // 3 = Rejected (مرفوض)
            else if (doc.status === 4) displayStatus = DOCUMENT_STATUS.REJECTED;      // 4 = Expired (منتهي الصلاحية - نعتبره مرفوض)
            
            console.log('✅ [Document] Mapped status:', {
              backendStatus: doc.status,
              backendStatusName: doc.statusName,
              mappedStatus: displayStatus,
              label: DOCUMENT_STATUS_LABELS[displayStatus],
            });
            
            switch (doc.type) {
              case 0: // NationalId
                setFormData(prev => ({ ...prev, nationalIdPreview: doc.documentUrl }));
                newStatuses.nationalId = displayStatus;
                break;
              case 1: // MedicalPracticeLicense
                setFormData(prev => ({ ...prev, medicalLicensePreview: doc.documentUrl }));
                newStatuses.medicalLicense = displayStatus;
                break;
              case 2: // SyndicateMembershipCard
                setFormData(prev => ({ ...prev, syndicateMembershipPreview: doc.documentUrl }));
                newStatuses.syndicateMembership = displayStatus;
                break;
              case 3: // MedicalGraduationCertificate
                setFormData(prev => ({ ...prev, graduationCertificatePreview: doc.documentUrl }));
                newStatuses.graduationCertificate = displayStatus;
                break;
              case 4: // SpecialtyCertificate
                setFormData(prev => ({ ...prev, specializationCertificatePreview: doc.documentUrl }));
                newStatuses.specializationCertificate = displayStatus;
                break;
            }
          });
          
          setDocumentStatuses(prev => ({ ...prev, ...newStatuses }));
        }
      }

      // Process research documents
      console.log('📄 [Fetch] Research docs result:', researchDocs);
      if (researchDocs.status === 'fulfilled') {
        const docs = researchDocs.value.data || researchDocs.value;
        console.log('📄 [Fetch] Research docs array:', docs);
        if (Array.isArray(docs) && docs.length > 0) {
          const researchFiles = docs.map(doc => ({
            name: doc.typeName || 'بحث علمي',
            preview: doc.documentUrl,
            file: null,
          }));
          console.log('📄 [Fetch] Mapped research files:', researchFiles);
          setFormData(prev => ({ ...prev, researchPapersImages: researchFiles }));
        } else {
          console.log('⚠️ [Fetch] No research documents found or not an array');
        }
      }

      // Process award documents
      console.log('📸 [Fetch] Award docs result:', awardDocs);
      if (awardDocs.status === 'fulfilled') {
        const docs = awardDocs.value.data || awardDocs.value;
        console.log('📸 [Fetch] Award docs array:', docs);
        if (Array.isArray(docs) && docs.length > 0) {
          const awardFiles = docs.map(doc => ({
            name: doc.typeName || 'جائزة',
            preview: doc.documentUrl,
            file: null,
          }));
          console.log('📸 [Fetch] Mapped award files:', awardFiles);
          setFormData(prev => ({ ...prev, awardsImages: awardFiles }));
        } else {
          console.log('⚠️ [Fetch] No award documents found or not an array');
        }
      }

    } catch (error) {
      console.error('Failed to fetch professional documents:', error);
    }
  }, []);
  
  // Fetch profile data on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchProfileData();
      await fetchSpecialtyExperience();
      await fetchProfessionalDocuments();
      
      // Update lastSavedDataRef after fetching to prevent auto-save trigger
      setTimeout(() => {
        lastSavedDataRef.current = JSON.stringify(formData);
      }, 100);
    };
    
    loadData();
  }, [fetchProfileData, fetchSpecialtyExperience, fetchProfessionalDocuments]);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, files, type, multiple } = e.target;
    
    // Handle file upload (profile picture)
    if (name === 'profilePicture' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      profileImageFileRef.current = file; // Store in ref for auto-save
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }
    
    // Handle professional documents upload (single file)
    if (type === 'file' && files && files[0] && !multiple) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create preview for document
      const previewFieldName = name.replace('Photo', 'Preview');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [previewFieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
      return;
    }
    
    // Handle multiple files upload (awards, research papers)
    if (type === 'file' && files && multiple) {
      console.log(`📁 [handleChange] Multiple files for ${name}:`, files);
      const newFiles = Array.from(files);
      const filesWithPreview = [];
      
      let filesProcessed = 0;
      newFiles.forEach((file, index) => {
        console.log(`📁 [handleChange] Processing file ${index}:`, file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
          filesWithPreview.push({
            file: file,
            name: file.name,
            preview: reader.result
          });
          filesProcessed++;
          
          if (filesProcessed === newFiles.length) {
            console.log(`✅ [handleChange] All files processed for ${name}:`, filesWithPreview);
            setFormData(prev => {
              const updated = {
                ...prev,
                [name]: [...(prev[name] || []), ...filesWithPreview]
              };
              console.log(`📦 [handleChange] Updated formData.${name}:`, updated[name]);
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      });
      return;
    }
    
    // Handle Combobox change (returns object)
    if ((name === 'gender' || name === 'specialty') && typeof value === 'object') {
      setFormData(prev => ({ ...prev, [name]: value.name }));
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // Remove awards image
  const removeAwardsImage = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      awardsImages: prev.awardsImages.filter((_, index) => index !== indexToRemove)
    }));
  }, []);
  
  // Remove research papers image
  const removeResearchPapersImage = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      researchPapersImages: prev.researchPapersImages.filter((_, index) => index !== indexToRemove)
    }));
  }, []);
  
  // Handle submit for review
  const handleSubmitForReview = useCallback(async () => {
    try {
      console.log('📤 [Submit] Submitting profile for review...');
      
      const result = await doctorService.submitForReview();
      
      console.log('✅ [Submit] Response:', result);
      
      if (result.succeeded || result.isSuccess) {
        alert('✅ تم إرسال ملفك الشخصي للمراجعة بنجاح!\n\nسيتم مراجعة بياناتك من قبل فريقنا وسنقوم بإعلامك بالنتيجة قريباً.');
        
        // Refresh data
        await fetchProfileData();
        await fetchProfessionalDocuments();
      } else {
        throw new Error(result.message || 'فشل إرسال الملف للمراجعة');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'حدث خطأ أثناء إرسال الملف';
      
      // Check if already submitted
      if (errorMsg.includes('already been submitted')) {
        alert('⚠️ تم إرسال ملفك الشخصي للمراجعة مسبقاً.\n\nيرجى انتظار نتيجة المراجعة.');
      } else {
        alert(`❌ ${errorMsg}`);
      }
      
      console.error('❌ [Submit] Error:', error);
    }
  }, [fetchProfileData, fetchProfessionalDocuments]);
  
  // Auto-save function
  const performAutoSave = useCallback(async () => {
    // Check if there are actual changes
    const currentData = JSON.stringify(formData);
    if (currentData === lastSavedDataRef.current) {
      return; // No changes
    }
    
    setAutoSaveStatus('saving');
    
    try {
      const promises = [];
      
      // 1. Save personal info
      const personalDataToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: mapGenderToNumber(formData.gender),
        biography: formData.bio || null,
      };
      promises.push(doctorService.updatePersonalInfo(personalDataToSave));
      
      // 2. Save profile image if changed
      if (profileImageFileRef.current instanceof File) {
        promises.push(doctorService.updateProfileImage(profileImageFileRef.current));
        profileImageFileRef.current = null; // Clear after saving
      }
      
      // 3. Save specialty and experience
      if (formData.specialty || formData.experience) {
        const specialtyEnum = SPECIALTIES.find(s => s.name === formData.specialty)?.id || 0;
        promises.push(
          doctorService.updateSpecialtyExperience({
            medicalSpecialty: specialtyEnum,
            yearsOfExperience: parseInt(formData.experience) || 0,
          })
        );
      }
      
      // 4. Save professional documents
      const documentPromises = [];
      if (formData.nationalIdPhoto instanceof File) {
        documentPromises.push(
          doctorService.uploadRequiredDocument(formData.nationalIdPhoto, getDocumentTypeFromFieldName('nationalIdPhoto'))
        );
      }
      if (formData.medicalLicensePhoto instanceof File) {
        documentPromises.push(
          doctorService.uploadRequiredDocument(formData.medicalLicensePhoto, getDocumentTypeFromFieldName('medicalLicensePhoto'))
        );
      }
      if (formData.syndicateMembershipPhoto instanceof File) {
        documentPromises.push(
          doctorService.uploadRequiredDocument(formData.syndicateMembershipPhoto, getDocumentTypeFromFieldName('syndicateMembershipPhoto'))
        );
      }
      if (formData.graduationCertificatePhoto instanceof File) {
        documentPromises.push(
          doctorService.uploadRequiredDocument(formData.graduationCertificatePhoto, getDocumentTypeFromFieldName('graduationCertificatePhoto'))
        );
      }
      if (formData.specializationCertificatePhoto instanceof File) {
        documentPromises.push(
          doctorService.uploadRequiredDocument(formData.specializationCertificatePhoto, getDocumentTypeFromFieldName('specializationCertificatePhoto'))
        );
      }
      
      if (documentPromises.length > 0) {
        promises.push(...documentPromises);
      }
      
      // 5. Auto-save awards images
      console.log('📸 [Auto-save] Checking awardsImages:', formData.awardsImages);
      if (formData.awardsImages && formData.awardsImages.length > 0) {
        formData.awardsImages.forEach(({ file }, index) => {
          if (file instanceof File) {
            console.log(`📤 [Auto-save] Uploading award ${index}:`, file.name);
            promises.push(doctorService.uploadAwardDocument(file));
          }
        });
      }
      
      // 6. Auto-save research papers images
      console.log('📄 [Auto-save] Checking researchPapersImages:', formData.researchPapersImages);
      if (formData.researchPapersImages && formData.researchPapersImages.length > 0) {
        formData.researchPapersImages.forEach(({ file }, index) => {
          if (file instanceof File) {
            console.log(`📤 [Auto-save] Uploading research ${index}:`, file.name);
            promises.push(doctorService.uploadResearchDocument(file));
          }
        });
      }
      
      // Execute all saves
      console.log(`🚀 [Auto-save] Total promises: ${promises.length}`);
      const results = await Promise.allSettled(promises);
      
      // Check if at least one succeeded
      const hasSuccess = results.some(r => r.status === 'fulfilled');
      
      if (hasSuccess) {
        setAutoSaveStatus('saved');
        lastSavedDataRef.current = currentData;
        
        // Clear file objects after successful save (convert File to preview only)
        const updatedAwardsImages = formData.awardsImages?.map(item => 
          item.file instanceof File ? { ...item, file: null } : item
        ) || [];
        
        const updatedResearchPapersImages = formData.researchPapersImages?.map(item => 
          item.file instanceof File ? { ...item, file: null } : item
        ) || [];
        
        console.log('🧹 [Auto-save Cleanup] Clearing file objects...');
        setFormData(prev => ({
          ...prev,
          profilePicture: null,
          nationalIdPhoto: null,
          medicalLicensePhoto: null,
          syndicateMembershipPhoto: null,
          graduationCertificatePhoto: null,
          specializationCertificatePhoto: null,
          awardsImages: updatedAwardsImages,
          researchPapersImages: updatedResearchPapersImages,
        }));
        
        // Update document statuses for newly uploaded documents
        const newStatuses = {};
        if (formData.nationalIdPhoto instanceof File) newStatuses.nationalId = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.medicalLicensePhoto instanceof File) newStatuses.medicalLicense = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.syndicateMembershipPhoto instanceof File) newStatuses.syndicateMembership = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.graduationCertificatePhoto instanceof File) newStatuses.graduationCertificate = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.specializationCertificatePhoto instanceof File) newStatuses.specializationCertificate = DOCUMENT_STATUS.NOT_SUBMITTED;
        
        if (Object.keys(newStatuses).length > 0) {
          setDocumentStatuses(prev => ({ ...prev, ...newStatuses }));
        }
        
        // Refresh documents after auto-save
        console.log('🔄 [Auto-save] Refreshing documents...');
        await fetchProfessionalDocuments();
        console.log('✅ [Auto-save] Documents refreshed');
        
        // Clear status after 2 seconds
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } else {
        throw new Error('فشلت جميع عمليات الحفظ');
      }
      
    } catch (error) {
      console.error('❌ Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  }, [formData]);
  
  // Auto-save effect - triggers 3 seconds after changes
  useEffect(() => {
    // Skip if no changes or initial load
    if (!hasChangesRef.current) {
      hasChangesRef.current = true; // Mark as initialized
      lastSavedDataRef.current = JSON.stringify(formData);
      return;
    }
    
    // Check if data actually changed (not just from fetch)
    const currentData = JSON.stringify(formData);
    if (currentData === lastSavedDataRef.current) {
      return; // No real changes, skip auto-save
    }
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for 3 seconds (without showing pending status)
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 3000);
    
    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, performAutoSave]);
  
  // Handle save professional info
  const handleSaveProfessional = useCallback(async () => {
    try {
      const promises = [];
      
      // 1. Update specialty and experience if changed
      if (formData.specialty || formData.experience) {
        // Map specialty name to enum ID
        const specialtyEnum = SPECIALTIES.find(s => s.name === formData.specialty)?.id || 0;
        
        const specialtyExperienceData = {
          medicalSpecialty: specialtyEnum,
          yearsOfExperience: parseInt(formData.experience) || 0,
        };
        promises.push(doctorService.updateSpecialtyExperience(specialtyExperienceData));
      }
      
      // 2. Upload required documents (parallel)
      const requiredDocs = [
        { field: 'nationalIdPhoto', file: formData.nationalIdPhoto },
        { field: 'medicalLicensePhoto', file: formData.medicalLicensePhoto },
        { field: 'syndicateMembershipPhoto', file: formData.syndicateMembershipPhoto },
        { field: 'graduationCertificatePhoto', file: formData.graduationCertificatePhoto },
        { field: 'specializationCertificatePhoto', file: formData.specializationCertificatePhoto },
      ];
      
      requiredDocs.forEach(({ field, file }) => {
        if (file instanceof File) {
          const documentType = getDocumentTypeFromFieldName(field);
          promises.push(doctorService.uploadRequiredDocument(file, documentType));
        }
      });
      
      // 3. Upload awards (parallel)
      console.log('📸 [Awards] Current awardsImages:', formData.awardsImages);
      if (formData.awardsImages && formData.awardsImages.length > 0) {
        formData.awardsImages.forEach(({ file }, index) => {
          console.log(`📸 [Awards] Item ${index}:`, { isFile: file instanceof File, file });
          if (file instanceof File) {
            console.log(`📤 [Awards] Uploading file ${index}:`, file.name);
            promises.push(doctorService.uploadAwardDocument(file));
          }
        });
      }
      
      // 4. Upload research papers (parallel)
      console.log('📄 [Research] Current researchPapersImages:', formData.researchPapersImages);
      if (formData.researchPapersImages && formData.researchPapersImages.length > 0) {
        formData.researchPapersImages.forEach(({ file }, index) => {
          console.log(`📄 [Research] Item ${index}:`, { isFile: file instanceof File, file });
          if (file instanceof File) {
            console.log(`📤 [Research] Uploading file ${index}:`, file.name);
            promises.push(doctorService.uploadResearchDocument(file));
          }
        });
      }
      
      // Execute all requests in parallel
      console.log(`🚀 [Upload] Total promises to execute: ${promises.length}`);
      const results = await Promise.allSettled(promises);
      
      // Check results
      console.log('📊 [Upload] Results:', results);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      console.log(`✅ Success: ${successCount}, ❌ Failed: ${failCount}`);
      
      if (successCount > 0) {
        alert(`✅ تم حفظ ${successCount} عملية بنجاح${failCount > 0 ? ` (فشل ${failCount})` : ''}`);
        
        // Refresh data
        console.log('🔄 [Refresh] Fetching specialty and documents...');
        await fetchSpecialtyExperience();
        await fetchProfessionalDocuments();
        console.log('✅ [Refresh] Data refreshed');
        
        // Clear file objects for awards and research papers (convert File to preview only)
        console.log('🧹 [Cleanup] Before cleanup:', { 
          awardsImages: formData.awardsImages, 
          researchPapersImages: formData.researchPapersImages 
        });
        
        const updatedAwardsImages = formData.awardsImages?.map(item => 
          item.file instanceof File ? { ...item, file: null } : item
        ) || [];
        
        const updatedResearchPapersImages = formData.researchPapersImages?.map(item => 
          item.file instanceof File ? { ...item, file: null } : item
        ) || [];
        
        console.log('🧹 [Cleanup] After cleanup:', { 
          updatedAwardsImages, 
          updatedResearchPapersImages 
        });
        
        // Clear file objects (keep previews)
        setFormData(prev => ({
          ...prev,
          nationalIdPhoto: null,
          medicalLicensePhoto: null,
          syndicateMembershipPhoto: null,
          graduationCertificatePhoto: null,
          specializationCertificatePhoto: null,
          awardsImages: updatedAwardsImages,
          researchPapersImages: updatedResearchPapersImages,
        }));
        
        // Set all uploaded documents to 'not_submitted' status
        const newStatuses = {};
        if (formData.nationalIdPhoto instanceof File) newStatuses.nationalId = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.medicalLicensePhoto instanceof File) newStatuses.medicalLicense = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.syndicateMembershipPhoto instanceof File) newStatuses.syndicateMembership = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.graduationCertificatePhoto instanceof File) newStatuses.graduationCertificate = DOCUMENT_STATUS.NOT_SUBMITTED;
        if (formData.specializationCertificatePhoto instanceof File) newStatuses.specializationCertificate = DOCUMENT_STATUS.NOT_SUBMITTED;
        
        if (Object.keys(newStatuses).length > 0) {
          setDocumentStatuses(prev => ({ ...prev, ...newStatuses }));
        }
      } else {
        throw new Error('فشلت جميع العمليات');
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'حدث خطأ أثناء حفظ البيانات';
      alert(`❌ ${errorMsg}`);
    }
  }, [formData, fetchSpecialtyExperience, fetchProfessionalDocuments]);
  
  // Handle save personal info
  const handleSave = useCallback(async () => {
    try {
      const dataToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: mapGenderToNumber(formData.gender),
        biography: formData.bio || null,
      };
      
      // Prepare promises array for parallel execution
      const promises = [
        doctorService.updatePersonalInfo(dataToSave)
      ];
      
      if (formData.profilePicture instanceof File) {
        promises.push(doctorService.updateProfileImage(formData.profilePicture));
      }
      
      // Execute all requests in parallel
      const results = await Promise.allSettled(promises);
      
      const personalInfoResult = results[0];
      if (personalInfoResult.status === 'fulfilled') {
        const response = personalInfoResult.value;
        
        if (response.data) {
          const profileData = response.data;
          const formattedDate = formatDateFromISO(profileData.dateOfBirth);
          const genderInArabic = mapGenderToArabic(profileData.genderName);
          
          setFormData(prev => ({
            ...prev,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phoneNumber || '',
            dateOfBirth: formattedDate,
            gender: genderInArabic,
            bio: profileData.biography || '',
            profilePicture: null,
          }));
        }
        
        // Show success message
        alert('✅ تم حفظ البيانات الشخصية بنجاح');
      } else {
        const errorMsg = personalInfoResult.reason?.response?.data?.message || personalInfoResult.reason?.message || 'فشل حفظ البيانات الشخصية';
        console.error('❌ خطأ في حفظ البيانات الشخصية:', personalInfoResult.reason);
        throw new Error(errorMsg);
      }
      
      if (results.length > 1) {
        const imageResult = results[1];
        if (imageResult.status === 'fulfilled') {
          const imageResponse = imageResult.value;
          if (imageResponse.data?.profilePictureUrl) {
            const newImageUrl = imageResponse.data.profilePictureUrl;
            
            // Update preview
            setProfileImagePreview(newImageUrl);
            
            // Update formData with new URL
            setFormData(prev => ({
              ...prev,
              profilePictureUrl: newImageUrl,
              profilePicture: null // Clear file object
            }));
            
            // Update auth store with new profile image URL
            const { updateUserProfile } = useAuthStore.getState();
            updateUserProfile({ profileImageUrl: newImageUrl });
            
            alert('✅ تم رفع الصورة الشخصية بنجاح');
          }
        } else {
          const imageErrorMsg = imageResult.reason?.response?.data?.message || imageResult.reason?.message || 'فشل رفع الصورة الشخصية';
          console.error('❌ خطأ في رفع الصورة:', imageResult.reason);
          alert(`⚠️ ${imageErrorMsg}`);
        }
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'حدث خطأ أثناء حفظ البيانات';
      alert(`❌ ${errorMsg}`);
      console.error('❌ Error in handleSave:', error);
    }
  }, [formData]);
  
  // Render section based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInfoSection
            formData={formData}
            profileImagePreview={profileImagePreview}
            handleChange={handleChange}
            autoSaveStatus={autoSaveStatus}
          />
        );
      
      case 'professional':
        return (
          <ProfessionalInfoSection
            formData={formData}
            handleChange={handleChange}
            specialtyOptions={SPECIALTIES}
            removeAwardsImage={removeAwardsImage}
            removeResearchPapersImage={removeResearchPapersImage}
            documentStatuses={documentStatuses}
            onSubmitForReview={handleSubmitForReview}
            autoSaveStatus={autoSaveStatus}
          />
        );
      
      case 'clinic':
        return <ClinicInfoSection />;
      
      case 'services':
        return <ServicesSection />;
      
      case 'appointment':
        return <AppointmentSection />;
      
      case 'partner':
        return <PartnerSection />;
      
      case 'analytics':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">التحليلات</h3>
            <p className="text-slate-600">قريباً...</p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ProfileSidebar
            formData={formData}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          
          {/* Content Area */}
          <div className="flex-1">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;