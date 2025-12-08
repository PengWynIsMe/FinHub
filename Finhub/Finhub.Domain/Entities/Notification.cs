using System.ComponentModel.DataAnnotations;

namespace Finhub.Domain.Entities
{
    public class Notification
    {
        [Key]
        public Guid NotificationId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid RecipientUserId { get; set; } // Người nhận

        public Guid? SenderUserId { get; set; }   // Người gửi

        public Guid? RelatedEntityId { get; set; }

        [Required]
        [MaxLength(50)]
        public string EntityType { get; set; } = string.Empty; // TRANSACTION, BUDGET...

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Status { get; set; } = "UNREAD";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ
        public User Recipient { get; set; } = null!;
        public User? Sender { get; set; }
    }
}