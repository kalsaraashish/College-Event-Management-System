using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ClgEventBackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // BOTH: Admin + Student
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetEvent()
        {
            var query = _context.Events.AsQueryable();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    query = query.Where(e => e.OrganizerId == userId);
                }
            }

            var events = await query
                .OrderBy(e => e.EventDate)
                .Select(e => new
                {
                    e.EventId,
                    e.Title,
                    e.Description,
                    e.EventDate,
                    e.Location,
                    e.MaxParticipants,
                    e.EventType,
                    e.CreatedAt,
                    e.CategoryId,
                    CategoryName = e.Category != null ? e.Category.CategoryName : null,
                    OrganizerName = e.Organizer != null ? e.Organizer.Name : "Admin",
                    RegistrationCount = _context.EventRegistration.Count(r => r.EventId == e.EventId && r.Status != "Cancelled")
                })
                .ToListAsync();
            return Ok(events);
        }

        // BOTH: Admin + Student
        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            var eventid = await _context.Events
                .Where(e => e.EventId == id)
                .Select(e => new
                {
                    e.EventId,
                    e.Title,
                    e.Description,
                    e.EventDate,
                    e.Location,
                    e.MaxParticipants,
                    e.EventType,
                    e.CreatedAt,
                    e.CategoryId,
                    CategoryName = e.Category != null ? e.Category.CategoryName : null,
                    OrganizerName = e.Organizer != null ? e.Organizer.Name : "Admin",
                    RegistrationCount = _context.EventRegistration.Count(r => r.EventId == e.EventId && r.Status != "Cancelled")
                })
                .FirstOrDefaultAsync();

            if (eventid == null)
                return NotFound();

            return Ok(eventid);
        }

        // ADMIN + ORGANIZER
        [Authorize(Roles = "Admin,Organizer")]
        [HttpPost]
        public async Task<IActionResult> AddEvent([FromBody] Event eventObj)
        {
            if (eventObj == null)
                return BadRequest("Event payload is null.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    eventObj.OrganizerId = userId;
                }
            }

            eventObj.CreatedAt = DateTime.Now;

            _context.Events.Add(eventObj);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventById), new { id = eventObj.EventId }, eventObj);
        }

        // ADMIN + ORGANIZER
        [Authorize(Roles = "Admin,Organizer")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateEvent(int id, Event ev)
        {
            if (ev is null)
                return BadRequest("Event payload is null.");

            if (id != ev.EventId)
                return BadRequest("ID mismatch");

            var existingEvent = await _context.Events.AsNoTracking().FirstOrDefaultAsync(p => p.EventId == id);
            if (existingEvent == null)
                return NotFound();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    if (existingEvent.OrganizerId != userId)
                        return Forbid();
                    ev.OrganizerId = userId; // retain owner
                }
            }
            else
            {
                ev.OrganizerId = existingEvent.OrganizerId; // retain previous owner when modified by admin
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Events.Update(ev);
            await _context.SaveChangesAsync();

            return Ok(ev);
        }

        // ADMIN + ORGANIZER
        [Authorize(Roles = "Admin,Organizer")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Deleteevent(int id)
        {
            var delid = await _context.Events
                .Where(p => p.EventId == id)
                .FirstOrDefaultAsync();

            if (delid == null)
                return NotFound();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    if (delid.OrganizerId != userId)
                        return Forbid();
                }
            }

            _context.Events.Remove(delid);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // BOTH: Admin + Student
        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchEvents(string name)
        {
            var events = await _context.Events
                .Where(e => e.Title.Contains(name))
                .Select(e => new
                {
                    e.EventId,
                    e.Title,
                    e.Description,
                    e.EventDate,
                    e.Location,
                    e.MaxParticipants,
                    e.EventType,
                    e.CreatedAt,
                    e.CategoryId,
                    CategoryName = e.Category != null ? e.Category.CategoryName : null,
                    OrganizerName = e.Organizer != null ? e.Organizer.Name : "Admin",
                    RegistrationCount = _context.EventRegistration.Count(r => r.EventId == e.EventId && r.Status != "Cancelled")
                })
                .ToListAsync();

            return Ok(events);
        }

        // BOTH: Admin + Student
        [Authorize]
        [HttpGet("filter")]
        public async Task<IActionResult> FilterEvents(string? category, DateTime? date)
        {
            var query = _context.Events.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(e => e.Category.CategoryName == category);
            }

            if (date.HasValue)
            {
                query = query.Where(e => e.EventDate.Date == date.Value.Date);
            }

            var events = await query.ToListAsync();

            var result = events
                .Select(e => new
                {
                    e.EventId,
                    e.Title,
                    e.Description,
                    e.EventDate,
                    e.Location,
                    e.MaxParticipants,
                    e.EventType,
                    e.CreatedAt,
                    e.CategoryId,
                    CategoryName = e.Category != null ? e.Category.CategoryName : null,
                    OrganizerName = e.Organizer != null ? e.Organizer.Name : "Admin",
                    RegistrationCount = _context.EventRegistration.Count(r => r.EventId == e.EventId && r.Status != "Cancelled")
                })
                .ToList();

            return Ok(result);
        }

        // BOTH: Admin + Student
        [Authorize]
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingEvents()
        {
            var events = await _context.Events
                .Where(e => e.EventDate >= DateTime.Now)
                .OrderBy(e => e.EventDate)
                .Select(e => new
                {
                    e.EventId,
                    e.Title,
                    e.Description,
                    e.EventDate,
                    e.Location,
                    e.MaxParticipants,
                    e.EventType,
                    e.CreatedAt,
                    e.CategoryId,
                    CategoryName = e.Category != null ? e.Category.CategoryName : null,
                    OrganizerName = e.Organizer != null ? e.Organizer.Name : "Admin",
                    RegistrationCount = _context.EventRegistration.Count(r => r.EventId == e.EventId && r.Status != "Cancelled")
                })
                .ToListAsync();

            return Ok(events);
        }

        // STUDENT ONLY
        [Authorize(Roles = "Student")]
        [HttpGet("student/{studentId}/events")]
        public async Task<IActionResult> GetStudentEvents(int studentId)
        {
            var events = await _context.EventRegistration
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Event)
                .Select(r => new
                {
                    r.EventRegistrationId,
                    r.EventId,
                    r.Event.Title,
                    r.Event.EventDate,
                    r.Status
                })
                .ToListAsync();

            return Ok(events);
        }

        // BOTH: Admin + Student
        [Authorize]
        [HttpGet("{eventId}/available-slots")]
        public async Task<IActionResult> GetAvailableSlots(int eventId)
        {
            var eventData = await _context.Events.FindAsync(eventId);

            if (eventData == null)
                return NotFound();

            var registered = await _context.EventRegistration
                .CountAsync(r => r.EventId == eventId && r.Status != "Cancelled");

            var available = eventData.MaxParticipants - registered;

            return Ok(new
            {
                maxParticipants = eventData.MaxParticipants,
                registered = registered,
                available = available
            });
        }
    }
}