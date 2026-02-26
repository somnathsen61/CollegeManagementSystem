import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
    const [role, setRole] = useState("");
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            const currentRole = localStorage.getItem("role");
            const userId = localStorage.getItem("userId");
            setRole(currentRole);

            try {
                if (currentRole === "Admin") {
                    setUserName("Admin");
                    // Fetch global counts (Using .catch to prevent crash if an endpoint fails)
                    const sRes = await axios.get("https://localhost:7028/api/Students").catch(() => ({ data: [] }));
                    const tRes = await axios.get("https://localhost:7028/api/Teachers").catch(() => ({ data: [] }));
                    const dRes = await axios.get("https://localhost:7028/api/Departments").catch(() => ({ data: [] }));

                    setStats({
                        students: sRes.data.length,
                        teachers: tRes.data.length,
                        departments: dRes.data.length || 2 // Fallback if Departments API isn't fully built
                    });
                }
                else if (currentRole === "Teacher") {
                    // Fetch Teacher specific data
                    const tRes = await axios.get(`https://localhost:7028/api/Teachers/user/${userId}`);
                    const teacher = tRes.data;
                    setUserName(`${teacher.firstName} ${teacher.lastName}`);

                    const tId = teacher.teacherId || teacher.teacherID;
                    const allocRes = await axios.get(`https://localhost:7028/api/TeacherSubjectAllocations/teacher/${tId}`).catch(() => ({ data: [] }));
                    const sRes = await axios.get("https://localhost:7028/api/Students").catch(() => ({ data: [] }));

                    setStats({
                        myClasses: allocRes.data.length,
                        globalStudents: sRes.data.length,
                        departments: 2 // Static placeholder for campus departments
                    });
                }
                else if (currentRole === "Student") {
                    // Fetch Student specific data
                    const sProfileRes = await axios.get(`https://localhost:7028/api/Students/user/${userId}`);
                    const student = sProfileRes.data;
                    setUserName(`${student.firstName} ${student.lastName}`);

                    const sId = student.studentId || student.studentID;
                    const gradesRes = await axios.get(`https://localhost:7028/api/StudentGrades/student/${sId}`).catch(() => ({ data: [] }));

                    // Calculate CGPA strictly from PUBLISHED grades
                    const publishedGrades = gradesRes.data.filter(g => g.isPublished === true);
                    let totalCredits = 0;
                    let totalPoints = 0;

                    publishedGrades.forEach(g => {
                        if (g.totalMarks != null) {
                            // IIEST Shibpur grading logic
                            let pts = 0;
                            if (g.totalMarks >= 90) pts = 10;
                            else if (g.totalMarks >= 80) pts = 9;
                            else if (g.totalMarks >= 70) pts = 8;
                            else if (g.totalMarks >= 60) pts = 7;
                            else if (g.totalMarks >= 50) pts = 6;
                            else if (g.totalMarks >= 40) pts = 5;

                            const credit = g.subject?.credits > 0 ? g.subject?.credits : 3;
                            totalCredits += credit;
                            totalPoints += (credit * pts);
                        }
                    });

                    const calculatedCgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

                    setStats({
                        currentSemester: student.currentSemester,
                        cgpa: calculatedCgpa,
                        pendingAssignments: 0 // Hardcoded to 0 since we don't have an assignment module yet
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl font-semibold text-gray-500 animate-pulse">Loading Dashboard Data...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, {userName}!</h1>
                <p className="text-gray-600 mt-1">Here is your overview for today.</p>
            </div>

            {/* --- ADMIN DASHBOARD --- */}
            {role === "Admin" && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Total Students</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.students}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Active Teachers</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.teachers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Departments</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.departments}</p>
                    </div>
                </div>
            )}

            {/* --- TEACHER DASHBOARD --- */}
            {role === "Teacher" && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">My Assigned Classes</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.myClasses}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Campus Students</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.globalStudents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Departments</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.departments}</p>
                    </div>
                </div>
            )}

            {/* --- STUDENT DASHBOARD --- */}
            {role === "Student" && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Current Semester</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.currentSemester}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Overall CGPA</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.cgpa}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500 flex flex-col justify-center">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Pending Assignments</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.pendingAssignments}</p>
                    </div>
                </div>
            )}

            {/* A nice welcoming graphic/message below the stats */}
            <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-8 text-white shadow-md">
                <h2 className="text-2xl font-bold mb-2">Academic Session 2023-2024</h2>
                <p className="text-slate-300">Welcome to the College Management System. Navigate through the sidebar to access your profile, classes, and academic records.</p>
            </div>
        </div>
    );
}