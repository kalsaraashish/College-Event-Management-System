using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClgEventBackendApi.Models
{
    public class Attendance
    {
        [Key]
        public int AttendanceId { get; set; }

        [Required]
        public int EventRegistrationId { get; set; }

        [MaxLength(20)]
        public string AttendanceStatus { get; set; } = "Absent";

        public DateTime MarkedAt { get; set; } = DateTime.Now;

        // Foreign Key
        [ForeignKey("EventRegistrationId")]
        public EventRegistration? EventRegistration { get; set; }
    }
}