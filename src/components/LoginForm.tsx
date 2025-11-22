import React, { useState } from "react";
import { ALL_BRANCHES } from "@/constants/branches";
import { Eye, EyeOff, Mail, Phone as PhoneIcon } from "lucide-react";

interface LoginFormProps {
  onLogin: (credentials: { emailOrStudentId: string; password: string }) => void;
  onCreate: (credentials: { name: string; email: string; studentId: string; college: string; branch: string; phone: string; password: string }) => void;
  onClose: () => void;
}

const BRANCHES = [...ALL_BRANCHES, "Other"];

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCreate, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    college: "",
    branch: "",
    phone: "",
    password: "",
    emailOrStudentId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotValue, setForgotValue] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  
  // OTP verification states
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [phoneOTPSent, setPhoneOTPSent] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");
  const [phoneOTP, setPhoneOTP] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState({ email: false, phone: false });
  const [verifyLoading, setVerifyLoading] = useState({ email: false, phone: false });

  React.useEffect(() => {
    setShow(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (type: 'email' | 'phone') => {
    setError("");
    setOtpLoading({ ...otpLoading, [type]: true });
    
    try {
      const endpoint = type === 'email' 
        ? `/api/users/send-email-otp`
        : `/api/users/send-phone-otp`;
      
      const payload = type === 'email'
        ? { email: form.email }
        : { phone: form.phone };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (type === 'email') {
          setEmailOTPSent(true);
          setSuccess(`OTP sent! Check server console for the code. Email: ${form.email}`);
        } else {
          setPhoneOTPSent(true);
          setSuccess(`OTP sent! Check server console for the code. Phone: ${form.phone}`);
        }
      } else {
        setError(data.error || `Failed to send ${type} OTP`);
      }
    } catch (err) {
      setError(`Failed to send ${type} OTP. Please try again.`);
    } finally {
      setOtpLoading({ ...otpLoading, [type]: false });
    }
  };

  const handleVerifyOTP = async (type: 'email' | 'phone') => {
    setError("");
    setVerifyLoading({ ...verifyLoading, [type]: true });
    
    try {
      const endpoint = type === 'email'
        ? `/api/users/verify-email-otp`
        : `/api/users/verify-phone-otp`;
      
      const payload = type === 'email'
        ? { email: form.email, otp: emailOTP }
        : { phone: form.phone, otp: phoneOTP };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (type === 'email') {
          setEmailVerified(true);
          setSuccess("Email verified successfully!");
        } else {
          setPhoneVerified(true);
          setSuccess("Phone number verified successfully!");
        }
      } else {
        setError(data.error || `Invalid ${type} OTP`);
      }
    } catch (err) {
      setError(`Failed to verify ${type} OTP. Please try again.`);
    } finally {
      setVerifyLoading({ ...verifyLoading, [type]: false });
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotValue) {
      setError("Please enter your email or enrollment number");
      return;
    }
    
    setForgotLoading(true);
    setError("");
    setForgotMsg("");
    
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrStudentId: forgotValue })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setForgotMsg(data.message || "If this account exists, a password reset link will be sent to your email.");
        setForgotValue("");
      } else {
        setError(data.error || "Failed to process password reset request");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!form.name || !form.email || !form.studentId || !form.college || !form.branch || !form.phone || !form.password) {
          setError("All fields are required.");
          return;
        }
        
        if (!emailVerified) {
          setError("Please verify your email address with OTP");
          return;
        }
        
        if (!phoneVerified) {
          setError("Please verify your phone number with OTP");
          return;
        }
        
        await onCreate({
          name: form.name,
          email: form.email,
          studentId: form.studentId,
          college: form.college,
          branch: form.branch,
          phone: form.phone,
          password: form.password,
        });
        setSuccess("Registration successful! You can now login.");
        setIsRegister(false);
        setForm({ ...form, password: "" });
        setEmailOTP("");
        setPhoneOTP("");
        setEmailVerified(false);
        setPhoneVerified(false);
        setEmailOTPSent(false);
        setPhoneOTPSent(false);
      } else {
        if (!form.emailOrStudentId || !form.password) {
          setError("Email/Enrollment number and password are required.");
          return;
        }
        await onLogin({
          emailOrStudentId: form.emailOrStudentId,
          password: form.password,
        });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-500 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'}
        `}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Decorative Curved Gradient Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-b-[60px] flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
              {isRegister ? "Create Account" : "Login"}
            </h2>
            <p className="text-white/90 text-lg">
              {isRegister ? "Join our educational platform" : "Access your account"}
            </p>
          </div>
          {/* SVG Wave */}
          <svg className="absolute -bottom-1 left-0 w-full h-8" viewBox="0 0 400 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0C80 40 320 40 400 0V40H0V0Z" fill="white" />
          </svg>
        </div>
        {/* Tabs */}
        <div className="flex justify-center mt-4 mb-2 gap-2">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${!isRegister ? "bg-white text-indigo-600 border-b-2 border-indigo-500" : "bg-gray-100 text-gray-500"}`}
            onClick={() => {
              setIsRegister(false);
              setError("");
              setSuccess("");
              setEmailVerified(false);
              setPhoneVerified(false);
              setEmailOTPSent(false);
              setPhoneOTPSent(false);
            }}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${isRegister ? "bg-white text-indigo-600 border-b-2 border-indigo-500" : "bg-gray-100 text-gray-500"}`}
            onClick={() => {
              setIsRegister(true);
              setError("");
              setSuccess("");
            }}
          >
            Create Account
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 pt-2 pb-8 space-y-4 max-h-[70vh] overflow-y-auto">
          {showForgot ? (
            <>
              <input
                type="text"
                name="forgotValue"
                placeholder="Enter your Email or Enrollment Number"
                value={forgotValue}
                onChange={e => setForgotValue(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <button
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors duration-200 flex items-center justify-center"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
                onClick={() => { setShowForgot(false); setForgotMsg(""); setForgotValue(""); }}
              >
                Back to Login
              </button>
              {forgotMsg && <div className="text-green-600 text-sm text-center mt-2">{forgotMsg}</div>}
            </>
          ) : isRegister ? (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
                  disabled={emailVerified}
              />
                {!emailVerified && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendOTP('email')}
                      disabled={!form.email || otpLoading.email}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center"
                    >
                      {otpLoading.email ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          Send OTP
                        </>
                      )}
                    </button>
                    {emailOTPSent && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={emailOTP}
                          onChange={(e) => setEmailOTP(e.target.value)}
                          maxLength={6}
                          className="flex-1 px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyOTP('email')}
                          disabled={!emailOTP || verifyLoading.email}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors"
                        >
                          {verifyLoading.email ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {emailVerified && (
                  <div className="mt-1 text-xs text-green-600 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    Email verified ✓
                  </div>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile Number (e.g., +91 9876543210)"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                  disabled={phoneVerified}
                />
                {!phoneVerified && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendOTP('phone')}
                      disabled={!form.phone || otpLoading.phone}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center"
                    >
                      {otpLoading.phone ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          Send OTP
                        </>
                      )}
                    </button>
                    {phoneOTPSent && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={phoneOTP}
                          onChange={(e) => setPhoneOTP(e.target.value)}
                          maxLength={6}
                          className="flex-1 px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyOTP('phone')}
                          disabled={!phoneOTP || verifyLoading.phone}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors"
                        >
                          {verifyLoading.phone ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {phoneVerified && (
                  <div className="mt-1 text-xs text-green-600 flex items-center">
                    <PhoneIcon className="w-3 h-3 mr-1" />
                    Phone verified ✓
                  </div>
                )}
              </div>
              <input
                type="text"
                name="studentId"
                placeholder="Enrollment Number"
                value={form.studentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="text"
                name="college"
                placeholder="College Name"
                value={form.college}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              >
                <option value="">Select Branch</option>
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              <div className="relative">
              <input
                  type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                name="emailOrStudentId"
                placeholder="Email / Enrollment Number / Admin ID"
                value={form.emailOrStudentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div className="relative">
              <input
                  type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-white-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-white-600 hover:text-white text-sm font-medium hover:underline transition-colors"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          {!isRegister && (
            <div className="text-xs text-gray-500 text-center bg-blue-50 p-2 rounded">
              <strong>Admin Login:</strong> admin@eduportal.com / admin123
            </div>
          )}
          <button
            type="submit"
            disabled={loading || (isRegister && (!emailVerified || !phoneVerified))}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isRegister ? "Registering..." : "Logging in..."}
              </>
            ) : (
              isRegister ? "Register" : "Login"
            )}
          </button>
          <button
            type="button"
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
        <div className="text-center pb-4 text-gray-500 text-xs">
          Need help? Contact us at <a href="mailto:digidiplomahelp@gmail.com" className="text-blue-600 hover:text-blue-800">support@digidiploma.com</ a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 
