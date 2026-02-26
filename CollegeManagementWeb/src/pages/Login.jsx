import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 1. LOGIN (This works for everyone)
            const resLogin = await axios.post("https://localhost:7028/api/Auth/login", formData);
            const { token, role, userId } = resLogin.data;

            // 2. Save Essentials
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", userId);

            // 3. Fetch Name based on Role (The Fix)
            let userName = "User";

            if (role === "Student") {
                const resStudent = await axios.get(`https://localhost:7028/api/Students/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                userName = resStudent.data.firstName;
            }
            else if (role === "Teacher") {
                const resTeacher = await axios.get(`https://localhost:7028/api/Teachers/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                userName = resTeacher.data.firstName;
            }
            else if (role === "Admin") {
                userName = "Administrator";
            }

            localStorage.setItem("userName", userName);

            // 4. Redirect
            navigate("/dashboard");

        } catch (err) {
            console.error("Login Error:", err);
            // More helpful error message
            if (err.response && err.response.status === 404) {
                setError("Login successful, but profile not found. Contact Admin.");
            } else {
                setError("Invalid username or password");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    College Management System
                </h2>

                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username / ID</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. 2020CSB035"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}