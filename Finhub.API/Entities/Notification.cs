using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Notification
{
    public Guid NotificationId { get; set; }

    public Guid RecipientUserId { get; set; }

    public Guid? SenderUserId { get; set; }

    public Guid? RelatedEntityId { get; set; }

    public string EntityType { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual User RecipientUser { get; set; } = null!;

    public virtual User? SenderUser { get; set; }
}
