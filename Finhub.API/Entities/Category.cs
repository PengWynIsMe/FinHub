using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Category
{
    public Guid CategoryId { get; set; }

    public Guid? GroupId { get; set; }

    public Guid? ParentId { get; set; }

    public string Name { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string? Icon { get; set; }

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public virtual Group? Group { get; set; }

    public virtual ICollection<Category> InverseParent { get; set; } = new List<Category>();

    public virtual Category? Parent { get; set; }

    public virtual ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
