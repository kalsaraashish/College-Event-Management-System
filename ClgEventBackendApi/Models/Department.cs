using System.ComponentModel.DataAnnotations;

namespace ClgEventBackendApi.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }

        [Required]
        [MaxLength(100)]
        public string DepartmentName { get; set; }

        [MaxLength(250)]
        public string Description { get; set; }
    }
}
