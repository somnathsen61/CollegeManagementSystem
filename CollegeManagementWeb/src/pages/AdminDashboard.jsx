import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0 });

    useEffect(() => {
        // In a real app, you would create a specific endpoint like /api/Admin/stats
        // For now, let's just use existing endpoints to count rows
        const fetchStats = async () => {
            try {
                const s = await axios.get("https://localhost:7028/api/Students");
                const t = await axios.get("https://localhost:7028/api/Teachers");
                const sub = await axios.get("https://localhost:7028/api/Subjects");

                setStats({
                    students: s.data.length,
                    teachers: t.data.length,
                    subjects: sub.data.length
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Control Center</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                    <h3 className="text-gray-500 uppercase text-xs font-bold">Total Students</h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{stats.students}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
                    <h3 className="text-gray-500 uppercase text-xs font-bold">Total Teachers</h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{stats.teachers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
                    <h3 className="text-gray-500 uppercase text-xs font-bold">Total Subjects</h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{stats.subjects}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Register New User
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Assign Subject to Teacher
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Generate Marksheets
                    </button>
                </div>
            </div>
        </div>
    );
}