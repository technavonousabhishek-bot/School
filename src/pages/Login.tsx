import { useNavigate, Link } from "react-router-dom";

// ✅ Added `setIsLoggedIn` as a prop to change login state
function LoginForm({ setIsLoggedIn }) {
  const navigate = useNavigate();

  // 🧩 Added: simple login handler (no authentication)
  const handleLogin = (e) => {
    e.preventDefault();

    // 🧩 Accept any username/password — just mark as logged in
    setIsLoggedIn(true);

    // 🧭 Navigate to dashboard after login
    navigate("/");
  };

  return (
    <div>
      <div className="flex min-h-screen">
        {/* 🧩 Left Side (image + logo) */}
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
            src="/images/Welcome_Back.png"
            alt="Welcome Image"
          />
        </div>

        {/* Right Side */}
        <div className="relative w-1/2 bg-gray-100 flex items-center justify-center">
          <div className="w-full max-w-md px-8 py-12">
            <h2 className="text-3xl font-bold mb-8">Welcome Back</h2>

            {/* 🧩 Modified: added onSubmit to handle login */}
            <form onSubmit={handleLogin}>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none rounded-lg"
                type="email"
                required
              />

              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none rounded-lg"
                type="password"
                required
              />

              {/* 🧩 Modified: Changed anchor to <Link> for routing */}
              <div className="flex items-center mb-6">
                <Link to="/forgetpassword" className="text-gray-600 text-sm">
                  Forget Password?
                </Link>
              </div>

              {/* 🧩 Modified: Added type="submit" to trigger form */}
              <button
                type="submit"
                className="w-full bg-blue-900 text-white py-3 rounded text-lg font-semibold mb-4 rounded-lg"
              >
                Log In
              </button>
            </form>

            {/* 🧩 Modified: Changed Sign up link to router link */}
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-900 underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
