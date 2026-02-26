import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AllocateSubject() {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [form, setForm] = useState({
        teacherId: 0, // Initialize as integer
        subjectId: 0, // Initialize as integer
        academicYear: "2025-2026",
        semesterType: "Odd"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tRes = await axios.get("https://localhost:7028/api/Teachers");
                const sRes = await axios.get("https://localhost:7028/api/Subjects");

                console.log("Teachers Data:", tRes.data); // Debug Log
                console.log("Subjects Data:", sRes.data); // Debug Log

                setTeachers(tRes.data);
                setSubjects(sRes.data);
            } catch (err) {
                console.error("Error loading data", err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Ensure IDs are selected
        if (!form.teacherId || !form.subjectId) {
            alert("Please select both a Teacher and a Subject.");
            return;
        }

        try {
            // Note: Ensure payload keys match C# Model (TeacherID, SubjectID) if needed
            // Usually JSON deserializer is case-insensitive, but let's be safe.
            const payload = {
                teacherID: parseInt(form.teacherId),
                subjectID: parseInt(form.subjectId),
                academicYear: form.academicYear,
                semesterType: form.semesterType
            };

            console.log("Sending Payload:", payload); // Verify what we send

            await axios.post("https://localhost:7028/api/TeacherSubjectAllocations", payload);
            alert("Subject Assigned Successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Assignment Error:", err.response?.data || err);
            alert("Failed to assign subject. Check console for details.");
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Assign Subject to Teacher</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Teacher */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
                    <select
                        className="w-full border rounded p-2 mt-1"
                        // FIX: Parse String to Integer immediately
                        onChange={(e) => setForm({ ...form, teacherId: parseInt(e.target.value) })}
                        required
                        value={form.teacherId} // Control the component
                    >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map(t => {
                            // FIX: Handle Case Sensitivity
                            const tId = t.teacherId || t.teacherID || t.TeacherID;
                            const tEmpId = t.employeeId || t.employeeID || t.EmployeeID;

                            return (
                                <option key={tId} value={tId}>
                                    {t.firstName} {t.lastName} ({tEmpId})
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Select Subject */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Subject</label>
                    <select
                        className="w-full border rounded p-2 mt-1"
                        onChange={(e) => setForm({ ...form, subjectId: parseInt(e.target.value) })}
                        required
                        value={form.subjectId}
                    >
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => {
                            // FIX: Handle Case Sensitivity
                            const sId = s.subjectId || s.subjectID || s.SubjectID;

                            return (
                                <option key={sId} value={sId}>
                                    {s.subjectName} ({s.subjectCode}) - Sem {s.semester}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Academic Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2 mt-1"
                        value={form.academicYear}
                        onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
                    Assign
                </button>
            </form>
        </div>
    );
}