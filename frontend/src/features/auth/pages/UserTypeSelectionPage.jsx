import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Stethoscope, Pill, FlaskConical, Heart, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import authService from "@/api/services/auth.service";

const UserTypeSelectionPage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get Google token from location state (passed from GoogleLoginButton)
  const googleToken = location.state?.googleToken;

  // User type options
  const userTypes = [
    {
      type: 'patient',
      icon: User,
      title: 'مريض',
      titleEn: 'Patient',
      description: 'ابحث عن أطباء واحجز مواعيدك الطبية',
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
    },
    {
      type: 'doctor',
      icon: Stethoscope,
      title: 'طبيب',
      titleEn: 'Doctor',
      description: 'أدر عيادتك ومرضاك بكفاءة',
      gradient: 'from-teal-500 to-emerald-500',
      hoverGradient: 'hover:from-teal-600 hover:to-emerald-600',
    },
    {
      type: 'pharmacy',
      icon: Pill,
      title: 'صيدلية',
      titleEn: 'Pharmacy',
      description: 'استقبل وأدر الروشتات الطبية',
      gradient: 'from-green-500 to-lime-500',
      hoverGradient: 'hover:from-green-600 hover:to-lime-600',
    },
    {
      type: 'laboratory',
      icon: FlaskConical,
      title: 'معمل',
      titleEn: 'Laboratory',
      description: 'استقبل طلبات التحاليل والنتائج',
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-600',
    },
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    // Validation
    if (!selectedType) {
      setError('يرجى اختيار نوع الحساب');
      return;
    }

    if (!googleToken) {
      setError('لم يتم العثور على بيانات تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      navigate('/register');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register new user with selected type
      console.log('📤 Registering user with type:', selectedType);
      const response = await authService.googleLogin(googleToken, selectedType);
      
      console.log('📦 Backend Response:', response);
      
      // Backend returns: { isSuccess, message, data, errors, statusCode }
      const { isSuccess, data, statusCode, message } = response;
      
      console.log('📦 Full Data Object:', data);
      
      // Convert statusCode to number (might be string)
      const statusNum = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
      
      // Verify user was created successfully
      if (isSuccess && data && (statusNum === 200 || statusNum === 201)) {
        console.log('✅ User registered successfully with type:', selectedType);
        console.log('Status Code:', statusNum);
        console.log('User Object:', data.user);
        console.log('User Role from Backend:', data.user?.role);
        
        // Update auth store
        useAuthStore.setState({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          loading: false,
        });

        // Navigate based on user role from backend OR selected type as fallback
        let role = data.user?.role?.toLowerCase();
        
        // If backend didn't return role, use selectedType
        if (!role || role === 'null' || role === null) {
          console.log('⚠️ Backend did not return role, using selectedType:', selectedType);
          role = selectedType.toLowerCase();
        }
        
        console.log('📍 Final Role for Navigation:', role);
        
        const dashboardRoutes = {
          patient: '/patient/search',
          doctor: '/doctor/dashboard',
          pharmacy: '/pharmacy/dashboard',
          laboratory: '/laboratory/dashboard',
        };

        const targetRoute = dashboardRoutes[role] || '/doctor/dashboard';
        console.log('🎯 Navigating to:', targetRoute);
        navigate(targetRoute);
      } else {
        throw new Error(message || 'Unexpected response from backend');
      }
      
    } catch (error) {
      console.error('❌ Google registration failed:', error);
      const backendResponse = error.response?.data;
      const errorMessage = backendResponse?.message || error.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no Google token
  if (!googleToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-rose-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">خطأ في البيانات</h2>
          <p className="text-slate-600 mb-6">لم يتم العثور على بيانات تسجيل الدخول</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            العودة للتسجيل
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4" dir="rtl">
      {/* Main Container */}
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-3">مرحباً بك في شُريان</h1>
          <p className="text-lg text-slate-600">اختر نوع حسابك للمتابعة</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-center">
            <p className="text-rose-700 font-semibold">{error}</p>
          </div>
        )}

        {/* User Type Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userTypes.map((userType) => {
            const Icon = userType.icon;
            const isSelected = selectedType === userType.type;
            
            return (
              <button
                key={userType.type}
                onClick={() => handleTypeSelect(userType.type)}
                disabled={loading}
                className={`relative group bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected 
                    ? 'ring-4 ring-teal-400 ring-offset-2 scale-105' 
                    : 'hover:ring-2 hover:ring-slate-200'
                }`}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${userType.gradient} ${userType.hoverGradient} flex items-center justify-center shadow-lg transition-all duration-300`}>
                  <Icon className="text-white" size={40} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{userType.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{userType.titleEn}</p>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">{userType.description}</p>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType || loading}
            className="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جارِ إنشاء الحساب...</span>
              </>
            ) : (
              <>
                <span className="text-lg">متابعة</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            بالمتابعة، أنت توافق على{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
              الشروط والأحكام
            </a>
            {' '}و{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
              سياسة الخصوصية
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default UserTypeSelectionPage;
