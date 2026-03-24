using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.Today;
            var monthStart = new DateTime(today.Year, today.Month, 1);

            var totalEvents = await _context.Events.CountAsync();
            var totalRegistrations = await _context.EventRegistration.CountAsync();
            var totalAttendance = await _context.Attendances.CountAsync();
            var presentAttendance = await _context.Attendances
                .CountAsync(a => a.AttendanceStatus == "Present");

            var result = new
            {
                TotalEvents = totalEvents,
                TotalStudents = await _context.Students.CountAsync(),
                TotalRegistrations = totalRegistrations,
                TotalAttendance = totalAttendance,

                ActiveEvents = await _context.Events.CountAsync(e => e.EventDate.Date == today),
                UpcomingEvents = await _context.Events.CountAsync(e => e.EventDate.Date > today),
                CompletedEvents = await _context.Events.CountAsync(e => e.EventDate.Date < today),
                // There is no cancellation flag on Event yet, so keep this stable for UI.
                CancelledEvents = 0,
                TotalCategories = await _context.Categories.CountAsync(),

                AttendanceRate = totalAttendance == 0
                    ? 0
                    : Math.Round((double)presentAttendance * 100 / totalAttendance, 2),
                AvgParticipants = totalEvents == 0
                    ? 0
                    : Math.Round((double)totalRegistrations / totalEvents, 2),
                TotalDepartments = await _context.Departments.CountAsync(),
                NewEventsThisMonth = await _context.Events.CountAsync(e => e.CreatedAt >= monthStart)
            };

            return Ok(result);
        }

        [HttpGet("today-events")]
        public async Task<IActionResult> GetTodayEvents()
        {
            var today = DateTime.Today;

            var events = await _context.Events
                .Where(e => e.EventDate.Date == today)
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/dashboard/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentDashboard(int studentId)
        {
            var registeredEvents = await _context.EventRegistration
                .CountAsync(r => r.StudentId == studentId);

            var upcomingEvents = await _context.Events
                .Where(e => e.EventDate > DateTime.Now)
                .CountAsync();

            var attendance = await _context.Attendances
                .Where(a => a.EventRegistration.StudentId == studentId &&
                            a.AttendanceStatus == "Present")
                .CountAsync();

            return Ok(new
            {
                registeredEvents,
                upcomingEvents,
                attendance
            });
        }
    }
}
