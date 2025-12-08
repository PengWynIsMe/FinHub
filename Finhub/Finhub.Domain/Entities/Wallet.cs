using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Transactions;

namespace Finhub.Domain.Entities
{
    public class Wallet
    {
        [Key]
        public Guid WalletId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid GroupId { get; set; }

        // Logic: Null = Ví chung, Có ID = Ví riêng
        public Guid? OwnerUserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Type { get; set; } = "CASH";

        [MaxLength(10)]
        public string Currency { get; set; } = "VND";

        [Column(TypeName = "decimal(19,4)")]
        public decimal InitialBalance { get; set; } = 0;

        [Column(TypeName = "decimal(19,4)")]
        public decimal CurrentBalance { get; set; } = 0;

        public bool IsArchived { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ
        public Group Group { get; set; } = null!;
        public User? Owner { get; set; } // Có thể null
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

        public ICollection<WalletBalanceHistory> BalanceHistories { get; set; } = new List<WalletBalanceHistory>();
        public ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();
    }
}