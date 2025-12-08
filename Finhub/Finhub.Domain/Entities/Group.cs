using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Finhub.Domain.Entities
{
    public class Group
    {
        [Key]
        public Guid GroupId { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public GroupType Type { get; set; } // Enum: Personal, Family

        [Required]
        public Guid OwnerId { get; set; } // Admin tối cao

        [MaxLength(20)]
        public string? ThemeColor { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ
        public User Owner { get; set; } = null!; // Link tới bảng User
        public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
        public ICollection<Wallet> Wallets { get; set; } = new List<Wallet>();
    }
}