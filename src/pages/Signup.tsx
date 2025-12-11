import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";


type FormState = {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  role: string;
};

function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    role: "admin", // default role
  });

  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked } as any));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value } as any));
    }
  };

  // Handle signup submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      alert("Please accept the terms and privacy policy before signing up.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please confirm your password.");
      return;
    }

    setLoading(true);

    // Build payload matching your Django backend
    const payload = {
      username: formData.fullname,          // backend expects username -> we use fullname
      email: formData.email,
      phone_number: formData.phone,         // backend field name
      role: formData.role,                  // must be one of: admin|teacher|student|parent|staff
      password: formData.password,
      confirm_password: formData.confirmPassword,
    };

    try {
      const res = await fetch(API_ENDPOINTS.account.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok || res.status === 201) {
        // registration success
        // optionally save role/email locally if you need
        localStorage.setItem("userRole", formData.role);
        localStorage.setItem("userEmail", formData.email);

        // If backend sent a teacher_profile (admin-created profile matched by email), store it
        if (data && (data as any).teacher_profile) {
          try {
            localStorage.setItem("teacherProfile", JSON.stringify((data as any).teacher_profile));
            const displayName = (data as any).teacher_profile.teacher_name || formData.fullname;
            localStorage.setItem("userName", displayName);
          } catch (err) {
            console.warn("Could not persist teacher_profile from signup response", err);
          }
        } else {
          // still set a userName for UI
          localStorage.setItem("userName", formData.fullname);
        }

        // navigate according to role
        if (formData.role === "admin") navigate("/admin-dashboard");
        else if (formData.role === "teacher") navigate("/teacher-dashboard");
        else navigate("/");

      } else {
        // show error(s) returned by backend (serializer errors etc.)
        // backend often returns object of field errors or message
        let message = "Registration failed.";
        if (data) {
          if (typeof data === "string") message = data;
          else if (data.error) message = data.error;
          else if (data.non_field_errors) message = data.non_field_errors.join(" ");
          else {
            // flatten serializer field errors
            const parts: string[] = [];
            for (const key in data) {
              if (Array.isArray(data[key])) parts.push(`${key}: ${data[key].join(", ")}`);
              else parts.push(`${key}: ${String(data[key])}`);
            }
            if (parts.length) message = parts.join(" | ");
          }
        }
        alert(message);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="relative w-1/2 bg-white flex items-center justify-center">
        <div className="absolute top-0 left-0 p-6">
          <img
            src="/images/Navonous_Logo.png"
            alt="Navonous Logo"
            className="h-auto w-32"
          />
        </div>
        <img
          className="h-auto max-w-full"
          src="/images/Create_Account.png"
          alt="Create Account"
        />
      </div>

      {/* Right Side */}
      <div className="relative w-1/2 bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md px-8 py-12">
          <h2 className="text-3xl font-bold mb-8">Create account</h2>

          <form onSubmit={handleSubmit}>
            {/* Role selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <label className="block text-gray-700 font-medium mb-2">Fullname</label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="text"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="email"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">Phone number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="text"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="password"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="password"
              required
            />

            <div className="flex items-center mb-6">
              <input
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                type="checkbox"
                className="mr-2"
              />
              <label htmlFor="terms" className="text-gray-600 text-sm">
                I accept the terms and privacy policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg text-lg font-semibold mb-4 hover:bg-blue-800 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-900 underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;