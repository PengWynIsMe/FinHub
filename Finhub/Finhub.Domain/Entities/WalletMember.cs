using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class WalletMember
    {
        [Key]
        public Guid WalletMemberId { get; set; } = Guid.NewGuid();

        // FK đến Wallet
        public Guid WalletId { get; set; }
        public Wallet? Wallet { get; set; }

        // FK đến User
        public Guid UserId { get; set; }
        public User? User { get; set; }

        // Quyền truy cập (Enum: View / Edit / FullControl)
        public AccessLevel AccessLevel { get; set; }
    }
}
