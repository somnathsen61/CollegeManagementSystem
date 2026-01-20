namespace CollegeManagementAPI.Models.DTOs
{
    public class RegisterDto
    {
        // Common User Data
        public string Username { get; set; } // Will be EnrollmentNo or EmpID
        public string Password { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } // "Student" or "Teacher"

        // Student/Teacher Specific Data
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public int DepartmentId { get; set; }

        // Student Only
        public string? Program { get; set; }
        public int? CurrentSemester { get; set; }
        public int? BatchYear { get; set; }

        // Teacher Only
        public string? Designation { get; set; }
    }
}
