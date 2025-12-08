using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class Goal
    {
        [Key]
        public Guid GoalId { get; set; } = Guid.NewGuid();
        [Required] public Guid GroupId { get; set; }
        [Required][MaxLength(100)] public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(19,4)")]
        public decimal TargetAmount { get; set; }

        [Column(TypeName = "decimal(19,4)")]
        public decimal CurrentAmount { get; set; } = 0;

        public DateTime? Deadline { get; set; }
        [MaxLength(20)] public string Status { get; set; } = "IN_PROGRESS";

        public Group Group { get; set; } = null!;
    }
}