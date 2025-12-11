import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

interface LoginFormProps {
  setIsLoggedIn: (value: boolean) => void;
}

function LoginForm({ setIsLoggedIn }: LoginFormProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Build payload: backend LoginSerializer expects { email, password }
    const payload = {
      email: email,
      password: password,
    };

    try {

      const res = await fetch(API_ENDPOINTS.account.login, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        // credentials: 'include' // only if you use cookie/session auth
      });

      // Always read raw text first to capture any non-JSON error responses
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.warn("Login: received non-JSON response:", text);
      }

      console.log("Login response status:", res.status, "body:", data || text);

      if (!res.ok) {
        // Flatten common error shapes into a user-friendly message
        let msg = "Login failed.";
        if (data && typeof data === "object") {
          if (data.detail) msg = data.detail;
          else if (data.message) msg = data.message;
          else {
            const parts: string[] = [];
            for (const k in data) {
              const v = data[k];
              if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
              else parts.push(`${k}: ${String(v)}`);
            }
            if (parts.length) msg = parts.join(" | ");
          }
        } else if (text) {
          msg = text;
        }
        alert(msg);
        setLoading(false);
        return;
      }

      // Success: expect access & refresh tokens
      const { access, refresh, role, username, teacher_profile } = data as any;

      if (!access || !refresh) {
        alert("Login succeeded but tokens are missing in response.");
        setLoading(false);
        return;
      }

      // Store tokens & basic user info (localStorage used here for simplicity)
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("userRole", role || "student");
      localStorage.setItem("userEmail", email);
      // Keep both keys for compatibility: some components read `username`, others `userName`
      localStorage.setItem("username", username || email);
      localStorage.setItem("userName", username || email);

      // If backend included a teacher_profile (admin-created), persist it so dashboard can show it
      if (teacher_profile) {
        try {
          localStorage.setItem("teacherProfile", JSON.stringify(teacher_profile));
          // prefer displaying teacher's actual name
          const displayName = teacher_profile.teacher_name || teacher_profile.teacherName || username || email;
          localStorage.setItem("userName", displayName);
        } catch (err) {
          console.warn("Failed to save teacher_profile to localStorage", err);
        }
      }

      setIsLoggedIn(true);

      // Navigate according to role
      // Students should land on the main dashboard (/) rather than a non-existent
      // `/student` route. Teachers go to `/teacher`, admins to `/`.
      if (role === "admin") navigate("/");
      else if (role === "teacher") navigate("/teacher");
      else if (role === "student") navigate("/");
      else navigate("/");

    } catch (err) {
      console.error("Network error while logging in:", err);
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
          src="/images/Welcome_Back.png"
          alt="Welcome Image"
        />
      </div>

      {/* Right Side */}
      <div className="relative w-1/2 bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md px-8 py-12">
          <h2 className="text-3xl font-bold mb-8">Welcome Back</h2>

          <form onSubmit={handleLogin}>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none rounded-lg"
              type="email"
              required
            />

            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none rounded-lg"
              type="password"
              required
            />

            <div className="flex items-center mb-6">
              <Link to="/forgetpassword" className="text-gray-600 text-sm">
                Forget Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded text-lg font-semibold mb-4 rounded-lg disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-900 underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;