import { useEffect, useState } from "react";
import axios from "axios";
import { generateMarksheetPDF } from "../utils/pdfGenerator";

export default function GenerateMarksheets() {
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({ deptId: "", sem: "" });
    const [studentsReady, setStudentsReady] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load Departments for the dropdown
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await axios.get("https://localhost:7028/api/Departments"); // Assumes you have a Departments controller
                setDepartments(res.data);
            } catch (err) {
                console.error("Failed to load departments", err);
            }
        };
        fetchDepts();
    }, []);

    // Fetch the Validation Engine Data
    const handleSearch = async () => {
        if (!filters.deptId || !filters.sem) {
            alert("Please select both Department and Semester");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`https://localhost:7028/api/StudentGrades/readiness?deptId=${filters.deptId}&sem=${filters.sem}`);
            setStudentsReady(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch readiness data.");
        } finally {
            setLoading(false);
        }
    };

    // This runs when Admin clicks "Generate PDF"
    const handleGeneratePDF = async (studentId, sem, isReady) => {
        if (!isReady) {
            alert("Cannot generate marksheet. Teachers have not submitted all marks for this student.");
            return;
        }

        try {
            // 1. Tell the backend to mark these grades as IsPublished = true
            await axios.post(`https://localhost:7028/api/StudentGrades/publish/${studentId}/${sem}`);

            // 2. Fetch the Marksheet Data for the PDF
            const res = await axios.get(`https://localhost:7028/api/StudentGrades/marksheet?studentId=${studentId}&sem=${sem}`);

            // 3. Generate and Download PDF
            generateMarksheetPDF(res.data);

            // 4. Notify the Admin
            alert("Marksheet Generated and Results Published to Student Portal!");

        } catch (err) {
            console.error("Error generating PDF or publishing", err);
            alert("Failed to generate PDF or publish results. Check console.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Marksheet Generation Engine</h1>
            <p className="text-gray-600 mb-8">Validate grading completeness before publishing official marksheets.</p>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Course / Department</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        value={filters.deptId}
                        onChange={(e) => setFilters({ ...filters, deptId: e.target.value })}
                    >
                        <option value="">-- Select Course --</option>
                        {departments.map(d => (
                            <option key={d.departmentID} value={d.departmentID}>{d.departmentName}</option>
                        ))}
                        {/* Fallback if Departments API isn't ready: */}
                        <option value="1">Computer Science and Technology (CSE)</option>
                        <option value="2">Electronics and Communication (ECE)</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        value={filters.sem}
                        onChange={(e) => setFilters({ ...filters, sem: e.target.value })}
                    >
                        <option value="">-- Select Sem --</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSearch}
                    className="bg-slate-800 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-slate-700"
                >
                    {loading ? "Checking..." : "Check Status"}
                </button>
            </div>

            {/* Validation Table */}
            {studentsReady.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 border-b border-gray-200 text-sm uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Roll No</th>
                                <th className="px-6 py-4 font-semibold">Student Name</th>
                                <th className="px-6 py-4 font-semibold text-center">Grading Progress</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {studentsReady.map((student) => (
                                <tr key={student.studentID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.enrollmentNo}</td>
                                    <td className="px-6 py-4 text-gray-600">{student.studentName}</td>

                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-gray-800">{student.gradedSubjects}</span>
                                        <span className="text-gray-500"> / {student.totalSubjects} Subjects</span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {student.isReady ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                Ready to Publish
                                            </span>
                                        ) : (
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                Pending Marks
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleGeneratePDF(student.studentID, filters.sem, student.isReady)}
                                            disabled={!student.isReady}
                                            className={`px-4 py-2 rounded font-bold text-sm transition-colors ${student.isReady
                                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            Generate PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}