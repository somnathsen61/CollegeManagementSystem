import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MyClasses() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const userId = localStorage.getItem("userId");
                console.log("Current UserId:", userId); // Debug Log 1

                // 1. Get TeacherId from UserId
                // NOTE: The C# property is likely 'teacherId', not 'teacherId'
                const profileRes = await axios.get(`https://localhost:7028/api/Teachers/user/${userId}`);
                console.log("Teacher Profile:", profileRes.data); // Debug Log 2

                // FIX: Check if your backend sends 'teacherId' or 'teacherId'
                // We use || to handle both cases automatically
                const teacherId = profileRes.data.teacherId || profileRes.data.teacherID;

                console.log("Resolved TeacherId:", teacherId); // Debug Log 3

                if (!teacherId) {
                    console.error("Could not find TeacherId in profile response!");
                    return;
                }

                // 2. Get Assigned Subjects
                const classesRes = await axios.get(`https://localhost:7028/api/TeacherSubjectAllocations/teacher/${teacherId}`);
                console.log("Allocated Classes:", classesRes.data); // Debug Log 4
                setClasses(classesRes.data);

            } catch (error) {
                console.error("Error fetching classes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    if (loading) return <div className="p-8">Loading your classes...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Assigned Classes</h1>

            {classes.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    You have not been assigned any subjects yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => {
                        // FIX: Handle any casing (allocationId, AllocationID, or allocationID)
                        const validId = cls.allocationId || cls.allocationID || cls.AllocationID;

                        return (
                            <div key={validId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                                <div className="h-2 bg-blue-600"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">{cls.subjectName}</h2>
                                            <p className="text-sm text-gray-500 font-medium">{cls.subjectCode}</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                            {cls.department}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                                        <p className="flex justify-between">
                                            <span>Semester:</span> <span className="font-medium text-gray-800">{cls.semester}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span>Session:</span> <span className="font-medium text-gray-800">{cls.semesterType} {cls.academicYear}</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            console.log("Navigating to Id:", validId); // Debug Log
                                            navigate(`/grade-entry/${validId}`);
                                        }}
                                        className="w-full bg-slate-800 text-white py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                                    >
                                        Enter Marks
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}