namespace ClgEventBackendApi.Models.DTOs
{
    public class EventDto
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime EventDate { get; set; }

        public string Location { get; set; }
    }
}