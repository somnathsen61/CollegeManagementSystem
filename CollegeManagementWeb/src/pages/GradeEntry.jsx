import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function GradeEntry() {
    const { allocationId } = useParams();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [allocation, setAllocation] = useState(null);
    const [marksData, setMarksData] = useState({});
    const [loading, setLoading] = useState(true);

    // --- NEW: Helper to identify Lab Subjects ---
    const checkIsLab = (code) => {
        if (!code) return false;
        // Extract all digits into an array
        const digits = code.match(/\d/g);
        // If it has at least 3 digits, check if the 3rd one is >= 7
        if (digits && digits.length >= 3) {
            return parseInt(digits[2], 10) >= 7;
        }
        return false;
    };

    const isLab = checkIsLab(allocation?.subjectCode);

    useEffect(() => {
        const initPage = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const teacherRes = await axios.get(`https://localhost:7028/api/Teachers/user/${userId}`);
                const teacherId = teacherRes.data.teacherId || teacherRes.data.teacherID;

                const allAllocations = await axios.get(`https://localhost:7028/api/TeacherSubjectAllocations/teacher/${teacherId}`);
                const currentClass = allAllocations.data.find(a =>
                    (a.allocationId || a.allocationID || a.AllocationID) == allocationId
                );

                if (!currentClass) {
                    alert("Class not found!");
                    navigate("/my-classes");
                    return;
                }

                setAllocation(currentClass);

                const deptId = currentClass.departmentId || currentClass.departmentID || currentClass.DepartmentID;
                const subjectId = currentClass.subjectId || currentClass.subjectID || currentClass.SubjectID;

                const studentsRes = await axios.get(
                    `https://localhost:7028/api/Students/filter?deptId=${deptId}&sem=${currentClass.semester}`
                );
                setStudents(studentsRes.data);

                const existingGradesRes = await axios.get(
                    `https://localhost:7028/api/StudentGrades/class/${subjectId}/${currentClass.semester}`
                );
                const savedGrades = existingGradesRes.data;

                const initialMarks = {};
                studentsRes.data.forEach(s => {
                    const saved = savedGrades.find(g => g.studentID === s.studentId || g.studentId === s.studentId);
                    initialMarks[s.studentId] = {
                        internal: saved?.internalMarks?.toString() || "",
                        mid: saved?.midSemMarks?.toString() || "",
                        end: saved?.endSemMarks?.toString() || "",
                        // NEW: Read lab marks from endSemMarks since we save them there
                        lab: saved?.endSemMarks?.toString() || ""
                    };
                });
                setMarksData(initialMarks);

            } catch (error) {
                console.error("Error loading grade entry", error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [allocationId]);

    const handleInputChange = (studentId, field, value, maxLimit) => {
        if (value === "") {
            setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: "" } }));
            return;
        }

        if (!/^\d+$/.test(value)) return;
        const numValue = parseInt(value, 10);
        if (numValue > maxLimit) return;

        setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
    };

    const handleSubmit = async () => {
        const subjectId = allocation.subjectId || allocation.subjectID || allocation.SubjectID;
        const gradesToSubmit = [];

        students.forEach(student => {
            const sId = student.studentId || student.studentID || student.StudentID;
            const marks = marksData[sId] || { internal: "", mid: "", end: "", lab: "" };

            if (isLab) {
                // If Lab, only check the 'lab' field
                if (marks.lab !== "") {
                    gradesToSubmit.push({
                        studentID: sId,
                        subjectID: subjectId,
                        semester: allocation.semester,
                        academicYear: allocation.academicYear || allocation.AcademicYear || "2025-2026",
                        semesterType: allocation.semesterType || allocation.SemesterType || "Odd",
                        internalMarks: 0,
                        midSemMarks: 0,
                        endSemMarks: parseInt(marks.lab) // Send lab marks as endSemMarks
                    });
                }
            } else {
                // If Theory, check the standard 3 fields
                if (marks.internal !== "" || marks.mid !== "" || marks.end !== "") {
                    gradesToSubmit.push({
                        studentID: sId,
                        subjectID: subjectId,
                        semester: allocation.semester,
                        academicYear: allocation.academicYear || allocation.AcademicYear || "2025-2026",
                        semesterType: allocation.semesterType || allocation.SemesterType || "Odd",
                        internalMarks: marks.internal ? parseInt(marks.internal) : 0,
                        midSemMarks: marks.mid ? parseInt(marks.mid) : 0,
                        endSemMarks: marks.end ? parseInt(marks.end) : 0,
                    });
                }
            }
        });

        if (gradesToSubmit.length === 0) {
            alert("No marks entered to save!");
            return;
        }

        try {
            const response = await axios.post("https://localhost:7028/api/StudentGrades/bulk", gradesToSubmit);
            alert(response.data.message || "Marks Submitted Successfully!");
        } catch (error) {
            const errData = error.response?.data;
            if (errData && errData.errors) {
                alert("Validation Failed:\n" + Object.entries(errData.errors).map(([k, v]) => `${k}: ${v}`).join("\n"));
            } else {
                alert(errData?.title || "Failed to submit marks.");
            }
        }
    };

    const calculateTotal = (studentId) => {
        const m = marksData[studentId] || {};
        const i = parseInt(m.internal) || 0;
        const mid = parseInt(m.mid) || 0;
        const end = parseInt(m.end) || 0;
        return i + mid + end;
    };

    if (loading) return <div className="p-8">Loading class list...</div>;

    return (
        <div className="max-w-6xl mx-auto mb-10">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Enter Student Marks</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                        {allocation?.subjectName} ({allocation?.subjectCode}) - Sem {allocation?.semester}
                        {/* Dynamic UI Badge showing type */}
                        {isLab ? (
                            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded uppercase">Lab Subject</span>
                        ) : (
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase">Theory Subject</span>
                        )}
                    </p>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors"
                >
                    Submit Marks
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-gray-200 text-sm uppercase text-gray-600">
                        <tr>
                            <th className="px-4 py-3 font-semibold w-24">Roll No</th>
                            <th className="px-4 py-3 font-semibold">Student Name</th>

                            {/* --- CONDITIONAL HEADERS --- */}
                            {isLab ? (
                                <th className="px-4 py-3 font-semibold w-48 text-center bg-slate-200">Total Marks (100)</th>
                            ) : (
                                <>
                                    <th className="px-4 py-3 font-semibold w-32 text-center">Internal (20)</th>
                                    <th className="px-4 py-3 font-semibold w-32 text-center">Mid Sem (30)</th>
                                    <th className="px-4 py-3 font-semibold w-32 text-center">End Sem (50)</th>
                                    <th className="px-4 py-3 font-semibold w-24 text-center bg-slate-200">Total (100)</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <tr key={student.studentId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{student.enrollmentNo}</td>
                                <td className="px-4 py-3 text-gray-600">{student.firstName} {student.lastName}</td>

                                {/* --- CONDITIONAL INPUTS --- */}
                                {isLab ? (
                                    <td className="px-4 py-3 bg-slate-50">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="w-full text-center border border-gray-300 rounded px-2 py-2 font-bold text-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                            placeholder="0 - 100"
                                            value={marksData[student.studentId]?.lab || ""}
                                            onChange={(e) => handleInputChange(student.studentId, 'lab', e.target.value, 100)}
                                        />
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text" inputMode="numeric"
                                                className="w-full text-center border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                                placeholder="0" value={marksData[student.studentId]?.internal || ""}
                                                onChange={(e) => handleInputChange(student.studentId, 'internal', e.target.value, 20)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text" inputMode="numeric"
                                                className="w-full text-center border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                                placeholder="0" value={marksData[student.studentId]?.mid || ""}
                                                onChange={(e) => handleInputChange(student.studentId, 'mid', e.target.value, 30)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text" inputMode="numeric"
                                                className="w-full text-center border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                                placeholder="0" value={marksData[student.studentId]?.end || ""}
                                                onChange={(e) => handleInputChange(student.studentId, 'end', e.target.value, 50)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-blue-700 bg-slate-50">
                                            {calculateTotal(student.studentId)}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}