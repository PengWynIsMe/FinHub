using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class RecurringTransaction
{
    public Guid RecurringId { get; set; }

    public Guid WalletId { get; set; }

    public Guid UserId { get; set; }

    public Guid CategoryId { get; set; }

    public decimal Amount { get; set; }

    public string Frequency { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime NextRunDate { get; set; }

    public DateTime? EndDate { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual Wallet Wallet { get; set; } = null!;
}
