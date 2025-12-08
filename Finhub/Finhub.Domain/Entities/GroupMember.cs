using System.ComponentModel.DataAnnotations;

namespace Finhub.Domain.Entities
{
    public class GroupMember
    {
        [Key]
        public Guid MemberId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "MEMBER"; // OWNER, ADMIN, MEMBER

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ
        public Group Group { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}