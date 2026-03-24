using System.ComponentModel.DataAnnotations;

namespace ClgEventBackendApi.Models
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; }

        [MaxLength(250)]
        public string Description { get; set; }

        // Navigation
        public ICollection<Event>? Events { get; set; }
    }
}