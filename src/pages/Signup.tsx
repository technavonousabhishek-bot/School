import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    termsAccepted: false,
  });

  // 🧩 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🧩 Handle signup button click
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      alert("Please accept the terms and privacy policy before signing up.");
      return;
    }

    // Simulate signup success
    console.log("✅ User signed up:", formData);

    // Navigate to sidebar after signup
    navigate("/sidebar");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="relative w-1/2 bg-white flex items-center justify-center">
        <div className="absolute top-0 left-0 p-6">
          <img
            src="public/images/Navonous_Logo.png"
            alt="Navonous Logo"
            className="h-auto w-32"
          />
        </div>
        <img
          className="h-auto max-w-full"
          src="public/images/Create_Account.png"
          alt="Create Account"
        />
      </div>

      {/* Right Side */}
      <div className="relative w-1/2 bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md px-8 py-12">
          <h2 className="text-3xl font-bold mb-8">Create account</h2>

          <form onSubmit={handleSubmit}>
            <label className="block text-gray-700 font-medium mb-2">
              Fullname
            </label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="text"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="email"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">
              Phone number
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              type="text"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              name="password"
              value={formData.password}
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
              className="w-full bg-blue-900 text-white py-3 rounded-lg text-lg font-semibold mb-4 hover:bg-blue-800 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-900 underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
