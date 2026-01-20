using CollegeManagementAPI.Data;
using CollegeManagementAPI.Models;
using CollegeManagementAPI.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net; // For password hashing
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CollegeManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly CollegeDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(CollegeDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            // 1. Check if user already exists
            if (_context.Users.Any(u => u.Username == request.Username))
            {
                return BadRequest("User with this ID already exists.");
            }

            // 2. Create the User Login Entry first
            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                Role = request.Role,
                // SECURITY: Hash the password!
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(); // This generates the UserID

            // 3. Create the Profile based on Role
            if (request.Role == "Student")
            {
                var student = new Student
                {
                    UserId = newUser.UserId, // Link to the user we just made
                    DepartmentId = request.DepartmentId,
                    EnrollmentNo = request.Username, // Enrollment is the Username
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Phone = request.Phone,
                    Program = request.Program ?? "B.Tech",
                    CurrentSemester = request.CurrentSemester ?? 1,
                    BatchYear = request.BatchYear ?? DateTime.Now.Year
                };
                _context.Students.Add(student);
            }
            else if (request.Role == "Teacher")
            {
                var teacher = new Teacher
                {
                    UserId = newUser.UserId,
                    DepartmentId = request.DepartmentId,
                    EmployeeId = request.Username, // EmpID is the Username
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Phone = request.Phone,
                    Designation = request.Designation ?? "Assistant Professor"
                };
                _context.Teachers.Add(teacher);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Registration successful!" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto request)
        {
            // 1. Find user
            var user = _context.Users.SingleOrDefault(u => u.Username == request.Username);
            if (user == null) return Unauthorized("Invalid User.");

            // 2. Check Password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid Password.");
            }

            // GENERATE TOKEN
            string token = CreateToken(user);

            return Ok(new
            {
                token = token,  // <--- This is what React needs!
                role = user.Role
            });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), // Stores UserID
                new Claim(ClaimTypes.Name, user.Username),                    // Stores Username
                new Claim(ClaimTypes.Role, user.Role)                         // Stores Role (Student/Teacher)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("Jwt:Key").Value!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1), // Token lasts 1 day
                    signingCredentials: creds
                );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }
    }
}