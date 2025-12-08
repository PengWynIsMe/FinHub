using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class AccountPermission
    {
        [Key]
        public Guid PermissionId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid WalletId { get; set; }

        [Required]
        public Guid GranteeUserId { get; set; } // Người được cấp quyền

        [Required]
        public AccessLevel AccessLevel { get; set; } // Viewer/Spender

        // --- Logic Smart Request ---
        [Column(TypeName = "decimal(19,4)")]
        public decimal? MaxAmountPerTransaction { get; set; } // Hạn mức tự duyệt

        public bool RequireRequestForOverLimit { get; set; } = true;

        [Column(TypeName = "decimal(19,4)")]
        public decimal? DailySpendLimit { get; set; }

        // Quan hệ
        public Wallet Wallet { get; set; } = null!;
        public User Grantee { get; set; } = null!;
    }
}