using System.ComponentModel.DataAnnotations;

namespace ClgEventBackendApi.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; }

        public int? EventId { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}