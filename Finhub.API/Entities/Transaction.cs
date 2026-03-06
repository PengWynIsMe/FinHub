using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Transaction
{
    public Guid TransactionId { get; set; }

    public Guid WalletId { get; set; }

    public Guid UserId { get; set; }

    public Guid? CategoryId { get; set; }

    public decimal Amount { get; set; }

    public string Type { get; set; } = null!;

    public DateTime TransactionDate { get; set; }

    public string? Note { get; set; }

    public string? EvidenceUrl { get; set; }

    public string? Evaluation { get; set; }

    public string Status { get; set; } = null!;

    public Guid? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public Guid? RelatedTransactionId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual Category? Category { get; set; }

    public Guid? BudgetId { get; set; }

    public virtual Budget? Budget { get; set; }

    public virtual ICollection<Transaction> InverseRelatedTransaction { get; set; } = new List<Transaction>();

    public virtual Transaction? RelatedTransaction { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual Wallet Wallet { get; set; } = null!;

    public virtual ICollection<WalletBalanceHistory> WalletBalanceHistories { get; set; } = new List<WalletBalanceHistory>();
}
