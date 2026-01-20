using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class StudentGrade
{
    public int GradeId { get; set; }

    public int StudentId { get; set; }

    public int SubjectId { get; set; }

    public int? AllocationId { get; set; }

    public decimal? InternalMarks { get; set; }

    public decimal? MidSemMarks { get; set; }

    public decimal? EndSemMarks { get; set; }

    public decimal? TotalMarks { get; set; }

    public string? GradeObtained { get; set; }

    public string AcademicYear { get; set; } = null!;

    public int Semester { get; set; }

    public bool? IsPublished { get; set; }

    public virtual TeacherSubjectAllocation? Allocation { get; set; }

    public virtual Student Student { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;
}
