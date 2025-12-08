using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class Budget
    {
        [Key]
        public Guid BudgetId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid GroupId { get; set; }

        public Guid? CategoryId { get; set; }
        public Guid? WalletId { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal AmountLimit { get; set; }

        public BudgetType BudgetType { get; set; } = BudgetType.Monthly;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsRolling { get; set; } = false;

        // Quan hệ
        public Group Group { get; set; } = null!;
        public Category? Category { get; set; }
        public Wallet? Wallet { get; set; }
    }
}