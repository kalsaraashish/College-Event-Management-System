using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

            var queryEvents = _context.Events.AsQueryable();
            var queryRegistrations = _context.EventRegistration.AsQueryable();
            var queryAttendances = _context.Attendances.AsQueryable();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    queryEvents = queryEvents.Where(e => e.OrganizerId == userId);
                    queryRegistrations = queryRegistrations.Where(r => r.Event.OrganizerId == userId);
                    queryAttendances = queryAttendances.Where(a => a.EventRegistration.Event.OrganizerId == userId);
                }
            }

            var totalEvents = await queryEvents.CountAsync();
            var totalRegistrations = await queryRegistrations.CountAsync();
            var totalAttendance = await queryAttendances.CountAsync();
            var presentAttendance = await queryAttendances
                .CountAsync(a => a.AttendanceStatus == "Present");

            var result = new
            {
                TotalEvents = totalEvents,
                TotalStudents = await _context.Students.CountAsync(), // unchanged
                TotalRegistrations = totalRegistrations,
                TotalAttendance = totalAttendance,

                ActiveEvents = await queryEvents.CountAsync(e => e.EventDate.Date == today),
                UpcomingEvents = await queryEvents.CountAsync(e => e.EventDate.Date > today),
                CompletedEvents = await queryEvents.CountAsync(e => e.EventDate.Date < today),
                CancelledEvents = 0,
                TotalCategories = await _context.Categories.CountAsync(), // unchanged

                AttendanceRate = totalAttendance == 0
                    ? 0
                    : Math.Round((double)presentAttendance * 100 / totalAttendance, 2),
                AvgParticipants = totalEvents == 0
                    ? 0
                    : Math.Round((double)totalRegistrations / totalEvents, 2),
                TotalDepartments = await _context.Departments.CountAsync(), // unchanged
                NewEventsThisMonth = await queryEvents.CountAsync(e => e.CreatedAt >= monthStart)
            };

            return Ok(result);
        }

        [HttpGet("today-events")]
        public async Task<IActionResult> GetTodayEvents()
        {
            var today = DateTime.Today;

            var queryEvents = _context.Events.AsQueryable();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    queryEvents = queryEvents.Where(e => e.OrganizerId == userId);
                }
            }

            var events = await queryEvents
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
