using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventRegistrationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventRegistrationController(AppDbContext context)
        {
            _context = context;
        }

        // ===============================
        // Register Student for Event
        // ===============================
        [Authorize(Roles = "Student")]
        [HttpPost]
        public async Task<IActionResult> RegisterEvent(EventRegistration reg)
        {
            var studentProfile = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == reg.StudentId);

            if (studentProfile == null)
            {
                return BadRequest("Complete your student profile before registering for events.");
            }

            if (studentProfile.User == null || studentProfile.User.Status != "Approved")
            {
                return BadRequest("Your account is waiting for admin approval.");
            }

            var eventData = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == reg.EventId);

            if (eventData == null)
            {
                return NotFound("Event not found");
            }

            // Prevent duplicate registration
            var exists = await _context.EventRegistration
                .AnyAsync(r =>
                    r.StudentId == reg.StudentId &&
                    r.EventId == reg.EventId &&
                    r.Status != "Cancelled");

            if (exists)
            {
                return BadRequest("Already registered for this event");
            }

            // Check event capacity
            var registeredCount = await _context.EventRegistration
                .CountAsync(r =>
                    r.EventId == reg.EventId &&
                    r.Status != "Cancelled");

            if (eventData.MaxParticipants > 0 &&
                registeredCount >= eventData.MaxParticipants)
            {
                return BadRequest("This event is full");
            }

            reg.RegistrationDate = DateTime.Now;
            reg.Status = "Registered";

            _context.EventRegistration.Add(reg);

            // Notification
            _context.Notifications.Add(new Notification
            {
                Title = "New Event Registration",
                Message = $"A student registered for '{eventData.Title}'.",
                EventId = eventData.EventId,
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return Ok(reg);
        }

        // ===============================
        // Cancel Registration
        // ===============================
        [Authorize(Roles = "Student")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelRegistration(int id)
        {
            var reg = await _context.EventRegistration.FindAsync(id);

            if (reg == null)
                return NotFound("Registration not found");

            reg.Status = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok("Registration cancelled");
        }

        // ===============================
        // Admin: Get All Registrations
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllRegistrations()
        {
            var registrations = await _context.EventRegistration
                .Include(r => r.Event)
                .Include(r => r.Student)
                .ToListAsync();

            return Ok(registrations);
        }

        // ===============================
        // Admin: Get Registrations by Event
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetRegistrationsByEvent(int eventId)
        {
            var regs = await _context.EventRegistration
                .Where(r => r.EventId == eventId)
                .Include(r => r.Student)
                .ThenInclude(s => s.User)
                .Select(r => new
                {
                    r.EventRegistrationId,
                    r.EventId,
                    r.StudentId,
                    r.RegistrationDate,
                    r.Status,
                    StudentName = r.Student != null && r.Student.User != null ? r.Student.User.Name : null,
                    EnrollmentNo = r.Student != null ? r.Student.EnrollmentNo : null
                })
                .ToListAsync();

            return Ok(regs);
        }

        // ===============================
        // Student: Get My Registrations
        // ===============================
        [Authorize(Roles = "Student")]
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentRegistrations(int studentId)
        {
            var studentProfile = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentId == studentId);

            if (studentProfile == null)
            {
                return NotFound("Student profile not found");
            }

            var regs = await _context.EventRegistration
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Event)
                .Select(r => new
                {
                    r.EventRegistrationId,
                    r.EventId,
                    r.RegistrationDate,
                    r.Status,
                    EventTitle = r.Event.Title,
                    r.Event.EventDate,
                    r.Event.Location,
                    r.Event.EventType
                })
                .ToListAsync();

            return Ok(regs);
        }
    }
}