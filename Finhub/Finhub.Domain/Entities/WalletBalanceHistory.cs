using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class WalletBalanceHistory
    {
        [Key]
        public Guid HistoryId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid WalletId { get; set; }

        [Required]
        public Guid TransactionId { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal PreviousBalance { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal NewBalance { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal ChangeAmount { get; set; }

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ
        public Wallet Wallet { get; set; } = null!;
        public Transaction Transaction { get; set; } = null!;
    }
}