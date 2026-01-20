using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class Department
{
    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = null!;

    public string DepartmentCode { get; set; } = null!;

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();

    public virtual ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}
