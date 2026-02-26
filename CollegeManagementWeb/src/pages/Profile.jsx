import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const token = localStorage.getItem("token");

                // Call the new endpoint we just created
                const response = await axios.get(`https://localhost:7028/api/Students/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStudent(response.data);
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="p-8">Loading profile...</div>;
    if (!student) return <div className="p-8 text-red-500">Student details not found.</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-slate-800 p-6 text-white flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold border-4 border-white">
                    {student.firstName[0]}{student.lastName[0]}
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
                    <p className="opacity-80">{student.program} Student</p>
                </div>
            </div>

            {/* Profile Details */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Academic Info</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <span className="text-gray-500">Enrollment No:</span>
                        <span className="font-medium">{student.enrollmentNo}</span>

                        <span className="text-gray-500">Department:</span>
                        <span className="font-medium">{student.department ? student.department.departmentCode : "N/A"}</span>

                        <span className="text-gray-500">Current Semester:</span>
                        <span className="font-medium">{student.currentSemester}</span>

                        <span className="text-gray-500">Batch Year:</span>
                        <span className="font-medium">{student.batchYear}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Contact Info</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium">{student.phone}</span>

                        {/* We could fetch Email from the User object if needed, but for now: */}
                        <span className="text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}