using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class Student
{
    public int StudentId { get; set; }

    public int UserId { get; set; }

    public int DepartmentId { get; set; }

    public string EnrollmentNo { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Program { get; set; } = null!;

    public int CurrentSemester { get; set; }

    public int BatchYear { get; set; }

    public string? Phone { get; set; }

    public virtual Department? Department { get; set; }

    public virtual ICollection<StudentGrade> StudentGrades { get; set; } = new List<StudentGrade>();

    public virtual User? User { get; set; }
}
