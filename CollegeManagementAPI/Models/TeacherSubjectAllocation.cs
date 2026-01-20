using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class TeacherSubjectAllocation
{
    public int AllocationId { get; set; }

    public int TeacherId { get; set; }

    public int SubjectId { get; set; }

    public string AcademicYear { get; set; } = null!;

    public string SemesterType { get; set; } = null!;

    public virtual ICollection<StudentGrade> StudentGrades { get; set; } = new List<StudentGrade>();

    public virtual Subject Subject { get; set; } = null!;

    public virtual Teacher Teacher { get; set; } = null!;
}
