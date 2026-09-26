import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaUserMd, FaUser, FaStethoscope, FaHospital, FaDollarSign, FaCalendarAlt, FaUserFriends, FaChartBar } from "react-icons/fa";
import { useAuthStore } from "@/features/auth/store/authStore";
import doctorService from "@/api/services/doctor.service";

const ProfileSidebar = ({ formData, activeSection, setActiveSection }) => {
  const { user, updateUser } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState(user?.verificationStatus);
  
  // Fetch verification status from API
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        console.log('🔍 [ProfileSidebar] Fetching verification status...');
        const doctorData = await doctorService.getVerificationStatus();
        console.log('✅ [ProfileSidebar] Doctor data:', doctorData);
        
        if (doctorData?.verificationStatus !== undefined) {
          setVerificationStatus(doctorData.verificationStatus);
          // Update user in auth store
          updateUser({ verificationStatus: doctorData.verificationStatus });
          console.log('✅ [ProfileSidebar] Updated verificationStatus:', doctorData.verificationStatus);
        }
      } catch (error) {
        console.error('❌ [ProfileSidebar] Error fetching verification status:', error);
      }
    };
    
    fetchVerificationStatus();
  }, [updateUser]);
  // Memoize color classes to avoid recreation on every render
  const colorClasses = useMemo(() => ({
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: 'text-emerald-600'
    },
    teal: {
      bg: 'bg-teal-100',
      text: 'text-teal-700',
      icon: 'text-teal-600'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      icon: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: 'text-red-600'
    }
  }), []);

  // Memoize sections array to avoid recreation
  const sections = useMemo(() => [
    { id: 'personal', name: 'المعلومات الشخصية', icon: FaUser, color: 'teal' },
    { id: 'professional', name: 'المعلومات المهنية', icon: FaStethoscope, color: 'teal' },
    { id: 'clinic', name: 'معلومات العيادة', icon: FaHospital, color: 'teal' },
    { id: 'services', name: 'الخدمات والأسعار', icon: FaDollarSign, color: 'teal' },
    { id: 'appointment', name: 'إعدادات المواعيد', icon: FaCalendarAlt, color: 'teal' },
    { id: 'partner', name: 'اقتراح شريك', icon: FaUserFriends, color: 'teal' },
    { id: 'analytics', name: 'التحليلات', icon: FaChartBar, color: 'teal' }
  ], []);

  return (
    <div className="lg:w-80">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-4">
            {/* Profile Image - Priority: uploaded file > formData preview > user.profileImageUrl > icon */}
            {formData.profilePicture instanceof File ? (
              <img
                src={URL.createObjectURL(formData.profilePicture)}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : formData.profilePictureUrl ? (
              <img
                src={formData.profilePictureUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-3 border-white">
                <FaUserMd className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                د. {formData.firstName || 'الاسم'} {formData.lastName || 'الأخير'}
              </h2>
              
              {/* Specialty + Badge in same line */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/90 text-sm">
                  {formData.specialty || 'التخصص غير محدد'}
                </span>
          
                {/* Verification Status Badge */}
                {verificationStatus !== undefined && verificationStatus !== null && (
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${verificationStatus === 0 ? 'bg-white/90 text-slate-700' : ''}
                    ${verificationStatus === 1 ? 'bg-white/90 text-amber-600' : ''}
                    ${verificationStatus === 2 ? 'bg-white/90 text-green-600' : ''}
                    ${verificationStatus === 3 ? 'bg-white/90 text-red-600' : ''}
                    ${verificationStatus === 4 ? 'bg-white/90 text-orange-600' : ''}
                    ${verificationStatus === 5 ? 'bg-white/90 text-teal-600' : ''}
                  `}>
                    {verificationStatus === 0 && 'غير معتمد'}
                    {verificationStatus === 1 && 'قيد المراجعة'}
                    {verificationStatus === 2 && 'معتمد'}
                    {verificationStatus === 3 && 'مرفوض'}
                    {verificationStatus === 4 && 'معلق'}
                    {verificationStatus === 5 && 'قيد المراجعة'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="p-4">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const colors = colorClasses[section.color];
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-200 ${
                    isActive
                      ? `${colors.bg} ${colors.text} shadow-sm`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? colors.icon : 'text-slate-400'}`} />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

// PropTypes for type checking
ProfileSidebar.propTypes = {
  formData: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    specialty: PropTypes.string,
  }).isRequired,
  activeSection: PropTypes.string.isRequired,
  setActiveSection: PropTypes.func.isRequired,
};

export default ProfileSidebar;