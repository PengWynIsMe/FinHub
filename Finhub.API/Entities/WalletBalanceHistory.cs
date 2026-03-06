using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class WalletBalanceHistory
{
    public Guid HistoryId { get; set; }

    public Guid WalletId { get; set; }

    public Guid TransactionId { get; set; }

    public decimal PreviousBalance { get; set; }

    public decimal NewBalance { get; set; }

    public decimal ChangeAmount { get; set; }

    public DateTime ChangedAt { get; set; }

    public virtual Transaction Transaction { get; set; } = null!;

    public virtual Wallet Wallet { get; set; } = null!;
}
