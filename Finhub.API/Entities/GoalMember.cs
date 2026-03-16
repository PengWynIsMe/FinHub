using System;

namespace Finhub.API.Entities
{
    public partial class GoalMember
    {
        public Guid GoalMemberId { get; set; }
        public Guid GoalId { get; set; }
        public Guid UserId { get; set; }

        public decimal TargetAmount { get; set; }
        public decimal ContributedAmount { get; set; }

        public virtual Goal Goal { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}