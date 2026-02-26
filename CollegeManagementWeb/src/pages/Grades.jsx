import { useEffect, useState } from "react";
import axios from "axios";

export default function Grades() {
    const [gradesBySemester, setGradesBySemester] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const userId = localStorage.getItem("userId");

                const studentRes = await axios.get(`https://localhost:7028/api/Students/user/${userId}`);
                const studentId = studentRes.data.studentId || studentRes.data.studentID;

                const gradesRes = await axios.get(`https://localhost:7028/api/StudentGrades/student/${studentId}`);

                // --- STRICT FILTERING ---
                // Only keep grades where isPublished is explicitly true
                const publishedGrades = gradesRes.data.filter(g => g.isPublished === true);

                const grouped = {};
                publishedGrades.forEach(g => {
                    const sem = g.semester;
                    if (!grouped[sem]) grouped[sem] = [];
                    grouped[sem].push(g);
                });

                const sortedGrouped = Object.keys(grouped)
                    .sort((a, b) => b - a)
                    .reduce((acc, key) => {
                        acc[key] = grouped[key];
                        return acc;
                    }, {});

                setGradesBySemester(sortedGrouped);
            } catch (error) {
                console.error("Error fetching grades", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    const getLetterGrade = (totalMarks, savedGrade) => {
        if (savedGrade) return savedGrade;
        if (totalMarks == null) return "-";

        if (totalMarks >= 90) return "A+";
        if (totalMarks >= 80) return "A";
        if (totalMarks >= 70) return "B";
        if (totalMarks >= 60) return "C";
        if (totalMarks >= 50) return "D";
        if (totalMarks >= 40) return "P";
        return "F";
    };

    const getGradePoint = (letter) => {
        const points = { "A+": 10, "A": 9, "B": 8, "C": 7, "D": 6, "P": 5, "F": 0 };
        return points[letter] || 0;
    };

    const calculateSemesterStats = (grades) => {
        let totalCredits = 0;
        let totalPoints = 0;

        grades.forEach(g => {
            if (g.totalMarks != null) {
                const letter = getLetterGrade(g.totalMarks, g.gradeObtained);
                const pts = getGradePoint(letter);
                const credit = g.subject?.credits > 0 ? g.subject?.credits : 3;

                totalCredits += credit;
                totalPoints += (credit * pts);
            }
        });

        const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
        return { totalCredits, totalPoints, sgpa };
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading your academic records...</div>;

    return (
        <div className="max-w-6xl mx-auto mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Academic Performance</h1>

            {Object.keys(gradesBySemester).length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-200">
                    <p className="text-gray-500">No grades have been published for you yet.</p>
                </div>
            ) : (
                Object.keys(gradesBySemester).map((sem) => {
                    const grades = gradesBySemester[sem];
                    const stats = calculateSemesterStats(grades);

                    return (
                        <div key={sem} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-8">

                            <div className="bg-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-xl font-bold text-white tracking-wide">Semester {sem}</h2>

                                <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-slate-200 items-center">
                                    <p>Total Credits: <span className="font-bold text-white text-base">{stats.totalCredits}</span></p>
                                    <p>Points Earned: <span className="font-bold text-white text-base">{stats.totalPoints}</span></p>
                                    <div className="bg-blue-600 px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                                        <span className="font-semibold text-blue-100">SGPA</span>
                                        <span className="font-bold text-white text-lg">{stats.sgpa}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-100 border-b border-gray-200 text-xs uppercase text-gray-600 tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Subject Code</th>
                                            <th className="px-6 py-4 font-semibold">Subject Name</th>
                                            <th className="px-6 py-4 font-semibold text-center">Credit</th>
                                            {/* 'Total Marks' header is completely removed here */}
                                            <th className="px-6 py-4 font-semibold text-center">Letter Grade</th>
                                            <th className="px-6 py-4 font-semibold text-center">Points Earned</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {grades.map((g) => {
                                            const letter = getLetterGrade(g.totalMarks, g.gradeObtained);
                                            const pts = getGradePoint(letter);
                                            const credit = g.subject?.credits > 0 ? g.subject?.credits : 3;
                                            const earned = g.totalMarks != null ? credit * pts : "-";

                                            return (
                                                <tr key={g.gradeId || g.subjectID} className="hover:bg-blue-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-700">{g.subject?.subjectCode || "-"}</td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium whitespace-normal">{g.subject?.subjectName || "-"}</td>
                                                    <td className="px-6 py-4 text-center text-gray-600">{credit}</td>

                                                    {/* 'Total Marks' data cell is completely removed here */}

                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${letter === 'F' ? 'bg-red-100 text-red-700' :
                                                                letter === '-' ? 'text-gray-400' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {letter}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-center font-bold text-blue-700 text-base">{earned}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}