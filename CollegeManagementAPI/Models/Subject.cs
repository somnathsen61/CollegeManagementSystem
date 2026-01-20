using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class Subject
{
    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = null!;

    public string SubjectCode { get; set; } = null!;

    public int DepartmentId { get; set; }

    public int Semester { get; set; }

    public int Credits { get; set; }

    public string SubjectLevel { get; set; } = null!;

    public virtual Department Department { get; set; } = null!;

    public virtual ICollection<StudentGrade> StudentGrades { get; set; } = new List<StudentGrade>();

    public virtual ICollection<TeacherSubjectAllocation> TeacherSubjectAllocations { get; set; } = new List<TeacherSubjectAllocation>();
}
