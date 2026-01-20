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
    }
}
