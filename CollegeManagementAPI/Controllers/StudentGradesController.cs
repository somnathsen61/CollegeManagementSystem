using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollegeManagementAPI.Data;
using CollegeManagementAPI.Models;

namespace CollegeManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentGradesController : ControllerBase
    {
        private readonly CollegeDbContext _context;

        public StudentGradesController(CollegeDbContext context)
        {
            _context = context;
        }

        // GET: api/StudentGrades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentGrade>>> GetStudentGrades()
        {
            return await _context.StudentGrades.ToListAsync();
        }

        // GET: api/StudentGrades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentGrade>> GetStudentGrade(int id)
        {
            var studentGrade = await _context.StudentGrades.FindAsync(id);

            if (studentGrade == null)
            {
                return NotFound();
            }

            return studentGrade;
        }

        // PUT: api/StudentGrades/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStudentGrade(int id, StudentGrade studentGrade)
        {
            if (id != studentGrade.GradeId)
            {
                return BadRequest();
            }

            _context.Entry(studentGrade).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentGradeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/StudentGrades
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<StudentGrade>> PostStudentGrade(StudentGrade studentGrade)
        {
            _context.StudentGrades.Add(studentGrade);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStudentGrade", new { id = studentGrade.GradeId }, studentGrade);
        }

        // DELETE: api/StudentGrades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudentGrade(int id)
        {
            var studentGrade = await _context.StudentGrades.FindAsync(id);
            if (studentGrade == null)
            {
                return NotFound();
            }

            _context.StudentGrades.Remove(studentGrade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StudentGradeExists(int id)
        {
            return _context.StudentGrades.Any(e => e.GradeId == id);
        }

        // GET: api/StudentGrades/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentGrade>>> GetGradesByStudentId(int studentId)
        {
            return await _context.StudentGrades
                .Include(g => g.Subject) // Link to Subject table
                .Where(g => g.StudentId == studentId)
                .OrderBy(g => g.Semester) // Sort by Semester 1, 2, 3...
                .ToListAsync();
        }

        // POST: api/StudentGrades/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> SubmitGrades([FromBody] List<StudentGrade> grades)
        {
            if (grades == null || grades.Count == 0)
                return BadRequest("No marks provided.");

            // 1. Determine if this is a Lab subject based on the SubjectCode
            int subjectId = grades.First().SubjectId;
            var subject = await _context.Subjects.FindAsync(subjectId);
            bool isLab = false;

            if (subject != null && !string.IsNullOrEmpty(subject.SubjectCode))
            {
                // Extract all numbers from the code (e.g., "CS3171" -> ['3','1','7','1'])
                var digits = new string(subject.SubjectCode.Where(char.IsDigit).ToArray());
                // Check if the 3rd digit (index 2) is >= 7
                if (digits.Length >= 3 && int.Parse(digits[2].ToString()) >= 7)
                {
                    isLab = true;
                }
            }

            int updatedCount = 0;
            int addedCount = 0;

            foreach (var incomingGrade in grades)
            {
                // 2. Dynamic Validation Limits
                if (!isLab)
                {
                    if (incomingGrade.InternalMarks > 20) return BadRequest($"Internal marks for Student {incomingGrade.StudentId} cannot exceed 20.");
                    if (incomingGrade.MidSemMarks > 30) return BadRequest($"MidSem marks for Student {incomingGrade.StudentId} cannot exceed 30.");
                    if (incomingGrade.EndSemMarks > 50) return BadRequest($"EndSem marks for Student {incomingGrade.StudentId} cannot exceed 50.");
                }
                else
                {
                    // For Labs, frontend sends the total in EndSemMarks. Max is 100.
                    if (incomingGrade.EndSemMarks > 100) return BadRequest($"Lab marks for Student {incomingGrade.StudentId} cannot exceed 100.");
                    incomingGrade.InternalMarks = 0; // Force to 0 for safety
                    incomingGrade.MidSemMarks = 0;   // Force to 0 for safety
                }

                // Calculate total
                decimal calculatedTotal = (incomingGrade.InternalMarks ?? 0) +
                                          (incomingGrade.MidSemMarks ?? 0) +
                                          (incomingGrade.EndSemMarks ?? 0);

                var existingGrade = await _context.StudentGrades.FirstOrDefaultAsync(g =>
                    g.StudentId == incomingGrade.StudentId &&
                    g.SubjectId == incomingGrade.SubjectId);

                if (existingGrade != null)
                {
                    // DIRTY CHECK
                    bool isChanged = existingGrade.InternalMarks != incomingGrade.InternalMarks ||
                                     existingGrade.MidSemMarks != incomingGrade.MidSemMarks ||
                                     existingGrade.EndSemMarks != incomingGrade.EndSemMarks;

                    if (isChanged)
                    {
                        existingGrade.InternalMarks = incomingGrade.InternalMarks;
                        existingGrade.MidSemMarks = incomingGrade.MidSemMarks;
                        existingGrade.EndSemMarks = incomingGrade.EndSemMarks;
                        existingGrade.TotalMarks = calculatedTotal;
                        existingGrade.ModifiedDate = DateTime.Now;

                        _context.StudentGrades.Update(existingGrade);
                        updatedCount++;
                    }
                }
                else
                {
                    // INSERT new record
                    incomingGrade.TotalMarks = calculatedTotal;
                    incomingGrade.CreatedDate = DateTime.Now;
                    incomingGrade.GradeObtained = "";

                    _context.StudentGrades.Add(incomingGrade);
                    addedCount++;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Successfully added {addedCount} and updated {updatedCount} records." });
        }

        // POST: api/StudentGrades/bulk
        //[HttpPost("bulk")]
        //public async Task<IActionResult> SubmitGrades([FromBody] List<StudentGrade> grades)
        //{
        //    if (grades == null || grades.Count == 0)
        //        return BadRequest("No grades provided.");

        //    foreach (var grade in grades)
        //    {
        //        // 1. Validate Constraints (Optional but good)
        //        if (grade.InternalMarks > 20) return BadRequest($"Internal marks for Student {grade.StudentId} cannot exceed 20.");
        //        if (grade.MidSemMarks > 30) return BadRequest($"MidSem marks for Student {grade.StudentId} cannot exceed 30.");
        //        if (grade.EndSemMarks > 50) return BadRequest($"EndSem marks for Student {grade.StudentId} cannot exceed 50.");

        //        // 2. Calculate Total Automatically
        //        // We use (value ?? 0) to treat nulls as 0
        //        grade.TotalMarks = (grade.InternalMarks ?? 0) +
        //                           (grade.MidSemMarks ?? 0) +
        //                           (grade.EndSemMarks ?? 0);

        //        //grade.DateOfGrading = DateTime.Now;
        //        grade.GradeObtained = ""; // Admin will assign Grade later based on TotalMarks

        //        _context.StudentGrades.Add(grade);
        //    }

        //    await _context.SaveChangesAsync();
        //    return Ok(new { message = "Grades submitted successfully!" });
        //}

        // POST: api/StudentGrades/process-results
        // This calculates the Grade (AA, BB, etc.) based on TotalMarks
        [HttpPost("process-results")]
        public async Task<IActionResult> ProcessResults()
        {
            // 1. Get all grades that have marks but NO letter grade yet
            var grades = await _context.StudentGrades
                .Where(g => g.TotalMarks != null && (g.GradeObtained == "" || g.GradeObtained == null))
                .ToListAsync();

            if (grades.Count == 0)
                return Ok(new { message = "No pending grades to process." });

            int processedCount = 0;

            foreach (var grade in grades)
            {
                // 2. Logic to assign Grade (You can customize this logic)
                decimal score = grade.TotalMarks ?? 0;
                string letterGrade = "F";

                if (score >= 90) letterGrade = "AA";      // Outstanding
                else if (score >= 80) letterGrade = "AB"; // Excellent
                else if (score >= 70) letterGrade = "BB"; // Very Good
                else if (score >= 60) letterGrade = "BC"; // Good
                else if (score >= 50) letterGrade = "CC"; // Fair
                else if (score >= 40) letterGrade = "CD"; // Average
                else letterGrade = "F";                   // Fail

                // 3. Update the record
                grade.GradeObtained = letterGrade;
                processedCount++;
            }

            // 4. Save changes
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Successfully processed {processedCount} student grades." });
        }

        // GET: api/StudentGrades/class/5
        [HttpGet("class/{subjectId}/{semester}")]
        public async Task<ActionResult<IEnumerable<StudentGrade>>> GetGradesForClass(int subjectId, int semester)
        {
            return await _context.StudentGrades
                .Where(g => g.SubjectId == subjectId && g.Semester == semester)
                .ToListAsync();
        }

        // GET: api/StudentGrades/readiness?deptId=1&sem=5
        [HttpGet("readiness")]
        public async Task<IActionResult> GetMarksheetReadiness(int deptId, int sem)
        {
            // 1. Find out how many subjects are actually in this semester's syllabus
            // (e.g., 5 theory + 3 practical = 8 subjects)
            int totalSubjectsInSyllabus = await _context.Subjects
                .CountAsync(s => s.DepartmentId == deptId && s.Semester == sem);

            // 2. Get all students in this specific class
            var students = await _context.Students
                .Where(s => s.DepartmentId == deptId && s.CurrentSemester == sem)
                .OrderBy(s => s.EnrollmentNo)
                .ToListAsync();

            var readinessList = new List<object>();

            // 3. Check each student's grading status
            foreach (var student in students)
            {
                // Count how many grades the teachers have successfully submitted for this student
                int subjectsGraded = await _context.StudentGrades
                    .CountAsync(g => g.StudentId == student.StudentId
                                  && g.Semester == sem
                                  && g.TotalMarks != null);

                readinessList.Add(new
                {
                    studentID = student.StudentId,
                    enrollmentNo = student.EnrollmentNo,
                    studentName = $"{student.FirstName} {student.LastName}",
                    totalSubjects = totalSubjectsInSyllabus,
                    gradedSubjects = subjectsGraded,
                    // The magic boolean: True ONLY if teachers submitted everything
                    isReady = (totalSubjectsInSyllabus > 0 && subjectsGraded == totalSubjectsInSyllabus)
                });
            }

            return Ok(readinessList);
        }

        // Helper: Calculate IIEST Shibpur Letter Grade
        private string CalculateLetterGrade(decimal? totalMarks)
        {
            if (!totalMarks.HasValue) return "F";
            decimal score = totalMarks.Value;

            if (score >= 90) return "A+";
            if (score >= 80) return "A";
            if (score >= 70) return "B";
            if (score >= 60) return "C";
            if (score >= 50) return "D";
            if (score >= 40) return "P";
            return "F";
        }

        // Helper: Convert Grade to Points
        private int GetGradePoint(string grade)
        {
            return grade switch
            {
                "A+" => 10,
                "A" => 9,
                "B" => 8,
                "C" => 7,
                "D" => 6,
                "P" => 5,
                _ => 0
            };
        }

        // GET: api/StudentGrades/marksheet?studentId=5&sem=5
        [HttpGet("marksheet")]
        public async Task<IActionResult> GetMarksheetData(int studentId, int sem)
        {
            var student = await _context.Students
                .Include(s => s.Department)
                .FirstOrDefaultAsync(s => s.StudentId == studentId);

            if (student == null) return NotFound("Student not found");

            var grades = await _context.StudentGrades
                .Include(g => g.Subject)
                .Where(g => g.StudentId == studentId && g.Semester == sem)
                .ToListAsync();

            // Calculate exact grades on the fly if they haven't been saved yet
            var subjects = grades.Select(g => {
                string letter = string.IsNullOrEmpty(g.GradeObtained) ? CalculateLetterGrade(g.TotalMarks) : g.GradeObtained;
                int pts = GetGradePoint(letter);
                int credits = g.Subject.Credits > 0 ? g.Subject.Credits : 3; // Fallback to 3 if database has 0

                return new
                {
                    code = g.Subject.SubjectCode,
                    name = g.Subject.SubjectName,
                    credit = credits,
                    letterGrade = letter,
                    totalPointEarned = credits * pts
                };
            }).ToList();

            double totalCredits = subjects.Sum(s => s.credit);
            double totalPoints = subjects.Sum(s => s.totalPointEarned);
            double sgpa = totalCredits > 0 ? Math.Round(totalPoints / totalCredits, 2) : 0;

            var response = new
            {
                studentName = $"{student.FirstName} {student.LastName}",
                enrollmentNo = student.EnrollmentNo,
                program = student.Program ?? "Bachelor of Technology", // Fallback to B.Tech
                department = student.Department.DepartmentName,
                semester = sem,
                session = "2022-2023", // Matches the PDF format
                subjects = subjects,
                totalCredits = totalCredits,
                totalPoints = totalPoints,
                sgpa = sgpa
            };

            return Ok(response);
        }

        // POST: api/StudentGrades/publish/5/5
        [HttpPost("publish/{studentId}/{sem}")]
        public async Task<IActionResult> PublishGrades(int studentId, int sem)
        {
            var grades = await _context.StudentGrades
                .Where(g => g.StudentId == studentId && g.Semester == sem)
                .ToListAsync();

            if (!grades.Any())
                return NotFound("No grades found for this student and semester.");

            int publishedCount = 0;
            foreach (var grade in grades)
            {
                // Toggle the flag to true
                if (!grade.IsPublished.GetValueOrDefault())
                {
                    grade.IsPublished = true;
                    publishedCount++;
                }
            }

            // Only call SaveChanges if we actually updated something
            if (publishedCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"Successfully published {grades.Count} subjects." });
        }


    }
}
