using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClgEventBackendApi.Models
{
    public class Student
    {
        [Key]
        public int StudentId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string EnrollmentNo { get; set; }

        [MaxLength(50)]
        public string Course { get; set; }

        public int Year { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        // Foreign Key
        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Navigation Properties
        public ICollection<EventRegistration>? EventRegistrations { get; set; }
    }
}