import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (credentials: { emailOrStudentId: string; password: string }) => void;
  onCreate: (credentials: { name: string; email: string; studentId: string; college: string; branch: string; password: string }) => void;
  onClose: () => void;
}

const BRANCHES = [
  "Computer Engineering",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Automobile Engineering",
  "Other"
];

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCreate, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    college: "",
    branch: "",
    password: "",
    emailOrStudentId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotValue, setForgotValue] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  React.useEffect(() => {
    setShow(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!form.name || !form.email || !form.studentId || !form.college || !form.branch || !form.password) {
          setError("All fields are required.");
          return;
        }
        await onCreate({
          name: form.name,
          email: form.email,
          studentId: form.studentId,
          college: form.college,
          branch: form.branch,
          password: form.password,
        });
        setSuccess("Registration successful! You can now login.");
        setIsRegister(false);
        setForm({ ...form, password: "" });
      } else {
        if (!form.emailOrStudentId || !form.password) {
          setError("Email/Student ID and password are required.");
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
              {isRegister ? "Join our educational platform" : "Access your account - Admin or Student"}
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
            onClick={() => setIsRegister(false)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${isRegister ? "bg-white text-indigo-600 border-b-2 border-indigo-500" : "bg-gray-100 text-gray-500"}`}
            onClick={() => setIsRegister(true)}
          >
            Create Account
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 pt-2 pb-8 space-y-4">
          {showForgot ? (
            <>
              <input
                type="text"
                name="forgotValue"
                placeholder="Enter your Email or Student ID"
                value={forgotValue}
                onChange={e => setForgotValue(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <button
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition-colors duration-200"
                onClick={() => setForgotMsg("If this account exists, a password reset link will be sent.")}
              >
                Send Recovery Link
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
                onClick={() => { setShowForgot(false); setForgotMsg(""); }}
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
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="text"
                name="studentId"
                placeholder="Student ID"
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
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="emailOrStudentId"
                placeholder="Email / Student ID / Admin ID"
                value={form.emailOrStudentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-indigo-600 text-sm hover:underline"
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
            disabled={loading}
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
          Need help? Contact your institution
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 