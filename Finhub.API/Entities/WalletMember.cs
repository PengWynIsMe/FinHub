using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class WalletMember
{
    public Guid WalletMemberId { get; set; }

    public Guid WalletId { get; set; }

    public Guid UserId { get; set; }

    public int AccessLevel { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual Wallet Wallet { get; set; } = null!;
}
