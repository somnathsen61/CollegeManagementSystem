import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dynamic Form State
    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "Student", // Default role
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: "",

        // Student Specific
        enrollmentNo: "",
        program: "B.Tech",
        batchYear: new Date().getFullYear(),
        currentSemester: 1,

        // Teacher Specific
        employeeId: "",
        designation: "Assistant Professor"
    });

    useEffect(() => {
        // Fetch Departments for the dropdown
        const fetchDepts = async () => {
            try {
                const res = await axios.get("https://localhost:7028/api/Departments");
                setDepartments(res.data);
            } catch (err) {
                console.error("Failed to load departments", err);
            }
        };
        fetchDepts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Auto-convert number fields to integers
        const numFields = ["departmentId", "batchYear", "currentSemester"];
        const finalValue = numFields.includes(name) && value !== "" ? parseInt(value) : value;

        setForm({ ...form, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // NOTE: Ensure these property names match your C# 'RegisterDto' exactly!
            const payload = {
                username: form.username,
                password: form.password,
                role: form.role,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                departmentID: form.departmentId,
            };

            // Add specific fields based on role
            if (form.role === "Student") {
                payload.enrollmentNo = form.enrollmentNo;
                payload.program = form.program;
                payload.batchYear = form.batchYear;
                payload.currentSemester = form.currentSemester;
            } else if (form.role === "Teacher") {
                payload.employeeID = form.employeeId;
                payload.designation = form.designation;
            }

            await axios.post("https://localhost:7028/api/Auth/register", payload);
            alert(`${form.role} Registered Successfully!`);

            // Optionally redirect to dashboard or clear form
            navigate("/dashboard");
        } catch (err) {
            console.error("Registration Error:", err.response?.data || err);
            const errData = err.response?.data;
            if (typeof errData === "object" && errData.errors) {
                alert("Validation Failed:\n" + JSON.stringify(errData.errors));
            } else {
                alert(errData?.message || errData || "Failed to register user.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-6 mb-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Register New User</h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* -- 1. ACCOUNT DETAILS -- */}
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-blue-500">
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username (Login ID)</label>
                            <input type="text" name="username" value={form.username} onChange={handleChange} required className="w-full border rounded p-2 mt-1" placeholder="e.g. 2024CSB101" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                        </div>
                    </div>
                </div>

                {/* -- 2. PERSONAL DETAILS -- */}
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <select name="departmentId" value={form.departmentId} onChange={handleChange} required className="w-full border rounded p-2 mt-1">
                                <option value="">-- Select Department --</option>
                                {departments.map(d => (
                                    <option key={d.departmentId} value={d.departmentId}>{d.departmentName} ({d.departmentCode})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* -- 3. STUDENT SPECIFIC DETAILS -- */}
                {form.role === "Student" && (
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">Academic Info (Student)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment / Roll No</label>
                                <input type="text" name="enrollmentNo" value={form.enrollmentNo} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program</label>
                                <input type="text" name="program" value={form.program} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Batch Year</label>
                                <input type="number" name="batchYear" value={form.batchYear} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Semester</label>
                                <input type="number" name="currentSemester" value={form.currentSemester} onChange={handleChange} required className="w-full border rounded p-2 mt-1" min="1" max="8" />
                            </div>
                        </div>
                    </div>
                )}

                {/* -- 4. TEACHER SPECIFIC DETAILS -- */}
                {form.role === "Teacher" && (
                    <div className="bg-purple-50 p-4 rounded border border-purple-200">
                        <h2 className="text-lg font-semibold text-purple-800 mb-4 border-b border-purple-200 pb-2">Employment Info (Teacher)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} required className="w-full border rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <select name="designation" value={form.designation} onChange={handleChange} className="w-full border rounded p-2 mt-1">
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Professor">Professor</option>
                                    <option value="Guest Lecturer">Guest Lecturer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white font-bold py-3 rounded-lg shadow-md transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Registering..." : `Register ${form.role}`}
                </button>
            </form>
        </div>
    );
}