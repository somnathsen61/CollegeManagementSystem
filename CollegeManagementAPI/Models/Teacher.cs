using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class Teacher
{
    public int TeacherId { get; set; }

    public int UserId { get; set; }

    public int DepartmentId { get; set; }

    public string EmployeeId { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? Designation { get; set; }

    public string? Phone { get; set; }

    public virtual Department Department { get; set; } = null!;

    public virtual ICollection<TeacherSubjectAllocation> TeacherSubjectAllocations { get; set; } = new List<TeacherSubjectAllocation>();

    public virtual User User { get; set; } = null!;
}
