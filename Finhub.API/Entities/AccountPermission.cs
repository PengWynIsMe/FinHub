using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class AccountPermission
{
    public Guid PermissionId { get; set; }

    public Guid WalletId { get; set; }

    public Guid GranteeUserId { get; set; }

    public string AccessLevel { get; set; } = null!;

    public decimal? MaxAmountPerTransaction { get; set; }

    public bool RequireRequestForOverLimit { get; set; }

    public decimal? DailySpendLimit { get; set; }

    public virtual User GranteeUser { get; set; } = null!;

    public virtual Wallet Wallet { get; set; } = null!;
}
