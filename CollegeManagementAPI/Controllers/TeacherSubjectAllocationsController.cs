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
    public class TeacherSubjectAllocationsController : ControllerBase
    {
        private readonly CollegeDbContext _context;

        public TeacherSubjectAllocationsController(CollegeDbContext context)
        {
            _context = context;
        }

        // GET: api/TeacherSubjectAllocations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TeacherSubjectAllocation>>> GetTeacherSubjectAllocations()
        {
            return await _context.TeacherSubjectAllocations.ToListAsync();
        }

        // GET: api/TeacherSubjectAllocations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TeacherSubjectAllocation>> GetTeacherSubjectAllocation(int id)
        {
            var teacherSubjectAllocation = await _context.TeacherSubjectAllocations.FindAsync(id);

            if (teacherSubjectAllocation == null)
            {
                return NotFound();
            }

            return teacherSubjectAllocation;
        }

        // PUT: api/TeacherSubjectAllocations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTeacherSubjectAllocation(int id, TeacherSubjectAllocation teacherSubjectAllocation)
        {
            if (id != teacherSubjectAllocation.AllocationId)
            {
                return BadRequest();
            }

            _context.Entry(teacherSubjectAllocation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TeacherSubjectAllocationExists(id))
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

        // POST: api/TeacherSubjectAllocations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TeacherSubjectAllocation>> PostTeacherSubjectAllocation(TeacherSubjectAllocation teacherSubjectAllocation)
        {
            _context.TeacherSubjectAllocations.Add(teacherSubjectAllocation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTeacherSubjectAllocation", new { id = teacherSubjectAllocation.AllocationId }, teacherSubjectAllocation);
        }

        // DELETE: api/TeacherSubjectAllocations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeacherSubjectAllocation(int id)
        {
            var teacherSubjectAllocation = await _context.TeacherSubjectAllocations.FindAsync(id);
            if (teacherSubjectAllocation == null)
            {
                return NotFound();
            }

            _context.TeacherSubjectAllocations.Remove(teacherSubjectAllocation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TeacherSubjectAllocationExists(int id)
        {
            return _context.TeacherSubjectAllocations.Any(e => e.AllocationId == id);
        }
    }
}
