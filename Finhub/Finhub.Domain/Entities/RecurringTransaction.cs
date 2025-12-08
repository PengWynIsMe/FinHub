using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class RecurringTransaction
    {
        [Key]
        public Guid RecurringId { get; set; } = Guid.NewGuid();
        public Guid WalletId { get; set; }
        public Guid UserId { get; set; }
        public Guid CategoryId { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal Amount { get; set; }

        public Frequency Frequency { get; set; } // Daily, Weekly...
        public DateTime StartDate { get; set; }
        public DateTime NextRunDate { get; set; }
        public DateTime? EndDate { get; set; }

        public Wallet Wallet { get; set; } = null!;
        public User User { get; set; } = null!;
        public Category Category { get; set; } = null!;
    }
}