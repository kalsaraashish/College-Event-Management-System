using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClgEventBackendApi.Models
{
    public class EventRegistration
    {
        [Key]
        public int EventRegistrationId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public int EventId { get; set; }

        public DateTime RegistrationDate { get; set; } = DateTime.Now;

        [StringLength(20)]
        public string Status { get; set; } = "Registered";

        // Navigation Properties

        [ForeignKey("EventId")]
        public Event? Event { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }
}