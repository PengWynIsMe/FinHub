using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Transactions;

namespace Finhub.Domain.Entities
{
    public class User
    {
        [Key]
        public Guid UserId { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        public string? PasswordHash { get; set; } // Nullable

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation Properties (Quan hệ)
        // User thuộc nhiều group 
        public ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

        // User có thể tạo nhiều ví cá nhân hoặc ví nhóm
        public ICollection<Wallet> OwnedWallets { get; set; } = new List<Wallet>();

        // User được gán vào các ví (WalletMember)
        public ICollection<WalletMember> WalletMembers { get; set; } = new List<WalletMember>();

        // User tạo giao dịch
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

        // User nhận thông báo
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}