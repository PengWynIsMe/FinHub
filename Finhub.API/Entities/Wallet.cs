using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Wallet
{
    public Guid WalletId { get; set; }

    public Guid? GroupId { get; set; }

    public Guid? OwnerUserId { get; set; }

    public string Name { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string Currency { get; set; } = null!;

    public decimal InitialBalance { get; set; }

    public decimal CurrentBalance { get; set; }

    public bool IsArchived { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsDefaultAccount { get; set; }

    public int? AlertThresholdPercentage { get; set; }

    public virtual ICollection<AccountPermission> AccountPermissions { get; set; } = new List<AccountPermission>();

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public virtual Group? Group { get; set; }

    public virtual User? OwnerUser { get; set; }

    public virtual ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual ICollection<WalletBalanceHistory> WalletBalanceHistories { get; set; } = new List<WalletBalanceHistory>();

    public virtual ICollection<WalletMember> WalletMembers { get; set; } = new List<WalletMember>();
}
