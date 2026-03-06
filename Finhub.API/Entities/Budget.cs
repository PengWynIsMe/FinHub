using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Budget
{
    public string? Name { get; set; }

    public string? Icon { get; set; }

    public string? Color { get; set; }

    public Guid BudgetId { get; set; }

    public Guid? GroupId { get; set; }

    public Guid? CategoryId { get; set; }

    public Guid? WalletId { get; set; }

    public decimal AmountLimit { get; set; }

    public string BudgetType { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsRolling { get; set; }

    public virtual Category? Category { get; set; }

    public virtual Group Group { get; set; } = null!;

    public virtual Wallet? Wallet { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
