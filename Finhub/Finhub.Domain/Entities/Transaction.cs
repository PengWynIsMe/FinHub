using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class Transaction
    {
        [Key]
        public Guid TransactionId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid WalletId { get; set; }

        [Required]
        public Guid UserId { get; set; } // Người tạo (RequestedBy)

        public Guid? CategoryId { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal Amount { get; set; }

        [Required]
        public TransactionType Type { get; set; } // Enum: Expense, Income, Transfer

        public DateTime TransactionDate { get; set; }

        [MaxLength(500)]
        public string? Note { get; set; }

        public string? EvidenceUrl { get; set; } // Ảnh hóa đơn

        // --- Logic Duyệt ---
        public TransactionStatus Status { get; set; } = TransactionStatus.Pending; // Default Pending

        public Guid? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }

        // --- Logic Transfer 2 chiều ---
        public Guid? RelatedTransactionId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ
        public Wallet Wallet { get; set; } = null!;
        public User User { get; set; } = null!; // Người tạo
        public User? Approver { get; set; } // Người duyệt
        public Category? Category { get; set; }

        [ForeignKey("RelatedTransactionId")]
        public Transaction? RelatedTransaction { get; set; }
    }
}