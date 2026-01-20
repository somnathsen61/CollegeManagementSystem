using System;
using System.Collections.Generic;

namespace CollegeManagementAPI.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string? Email { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
