using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Group
{
    public Guid GroupId { get; set; }

    public string Name { get; set; } = null!;

    public string Type { get; set; } = null!;

    public Guid OwnerId { get; set; }

    public string? ThemeColor { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<Wallet> Wallets { get; set; } = new List<Wallet>();
}
