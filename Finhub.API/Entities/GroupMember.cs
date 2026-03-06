using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class GroupMember
{
    public Guid MemberId { get; set; }

    public Guid GroupId { get; set; }

    public Guid UserId { get; set; }

    public string Role { get; set; } = null!;

    public DateTime JoinedAt { get; set; }

    public virtual Group Group { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
