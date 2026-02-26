import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateMarksheetPDF = (data) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to center text easily
    const centerText = (text, y, fontSize, fontStyle = "normal") => {
        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
    };

    // --- NEW: Helpers for Sorting and Lab Checking ---
    const checkIsLab = (code) => {
        if (!code) return false;
        const digits = code.match(/\d/g);
        if (digits && digits.length >= 3) {
            return parseInt(digits[2], 10) >= 7;
        }
        return false;
    };

    const getNumericPart = (code) => {
        const match = code.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    // Sort subjects numerically based on Subject Code
    const sortedSubjects = [...data.subjects].sort((a, b) => getNumericPart(a.code) - getNumericPart(b.code));

    // Split into Theory and Lab arrays
    const theorySubjects = sortedSubjects.filter(sub => !checkIsLab(sub.code));
    const labSubjects = sortedSubjects.filter(sub => checkIsLab(sub.code));

    // --- 1. HEADER SECTION ---
    centerText("Indian Institute of Engineering Science and Technology, Shibpur", 20, 14, "bold");
    centerText(data.program || "Bachelor of Technology", 28, 12, "bold");
    centerText("[Four-Year Degree Course]", 34, 10, "normal");

    const semWords = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"];
    const semWord = semWords[data.semester - 1] || `${data.semester}th`;

    centerText(`${semWord} Semester Examination, 2023`, 42, 12, "bold");
    centerText(data.department || "Computer Science and Technology", 48, 12, "bold");

    // --- 2. STUDENT DETAILS ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Student Name: ${data.studentName}`, 15, 60);
    doc.text(`Examination Roll No: ${data.enrollmentNo}`, 15, 66);
    doc.text(`Registration No: ${data.enrollmentNo}`, 15, 72);

    // --- 3. ACADEMIC STATEMENT ---
    const statement = `The following is the statement of Grades obtained by the student in the ${semWord} Semester of the Academic session ${data.session} for which the examination was held in May, 2023.`;
    const splitText = doc.splitTextToSize(statement, pageWidth - 30);
    doc.text(splitText, 15, 82);

    // --- 4. GRADES TABLE (SPLIT INTO THEORY AND LAB) ---
    const tableColumn = ["Subject Code", "Subject Name", "Credit", "Letter\nGrade", "Total Grade\nPoint Earned"];

    // Map our split arrays into the rows format autoTable expects
    const theoryRows = theorySubjects.map(sub => [sub.code, sub.name, sub.credit, sub.letterGrade, sub.totalPointEarned]);
    const labRows = labSubjects.map(sub => [sub.code, sub.name, sub.credit, sub.letterGrade, sub.totalPointEarned]);

    // Define shared styles so both tables look identical and align perfectly
    const sharedStyles = {
        fontSize: 10,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        valign: 'middle'
    };

    const sharedColumnStyles = {
        0: { cellWidth: 30, halign: 'left' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' }
    };

    // A. Draw Theory Table (With Headers)
    if (theoryRows.length > 0) {
        autoTable(doc, {
            head: [tableColumn],
            body: theoryRows,
            startY: 95,
            theme: 'plain',
            styles: sharedStyles,
            headStyles: { fontStyle: 'bold', halign: 'center' },
            columnStyles: sharedColumnStyles
        });
    }

    // Get the Y position where the Theory table ended
    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 95;

    // B. Draw Lab Table (No Headers, plus a Y-axis Gap)
    if (labRows.length > 0) {
        autoTable(doc, {
            head: [], // Omit headers so it feels like a continuation
            body: labRows,
            startY: finalY + 5, // <--- This creates the gap!
            theme: 'plain',
            styles: sharedStyles,
            columnStyles: sharedColumnStyles
        });
        finalY = doc.lastAutoTable.finalY;
    }

    // --- 5. FOOTER TOTALS ---
    doc.setFont("helvetica", "bold");

    // Placed under the respective columns
    doc.text(`Total:     ${data.totalCredits}`, 115, finalY + 7);
    doc.text(`${data.totalPoints}`, 170, finalY + 7);

    // SGPA and Remarks
    doc.text(`SGPA: ${data.sgpa.toFixed(2)}`, 15, finalY + 18);
    doc.text("Remark: Pass", 15, finalY + 25);

    // Save the PDF
    doc.save(`${data.enrollmentNo}_Sem${data.semester}_Result.pdf`);
};