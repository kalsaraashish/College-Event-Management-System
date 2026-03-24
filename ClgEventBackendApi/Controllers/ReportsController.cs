using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Route("api/[controller]")]

    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetAllEvents()
        {
            var events = await _context.Events
                .Select(e => new
                {
                    e.EventId,
                    e.Title,
                    e.EventDate,
                    e.EventType,
                    RegistrationCount = _context.EventRegistration.Count(r => r.EventId == e.EventId),
                    PresentCount = _context.Attendances.Count(a => a.EventRegistration!.EventId == e.EventId && a.AttendanceStatus == "Present")
                })
                .ToListAsync();

            var report = events.Select(e => new
            {
                e.EventId,
                e.Title,
                e.EventDate,
                e.EventType,
                e.RegistrationCount,
                AttendancePercentage = e.RegistrationCount == 0
                    ? 0
                    : Math.Round((double)e.PresentCount * 100 / e.RegistrationCount, 2)
            });

            return Ok(report);
        }

        [HttpGet("event/{eventId}/participants")]
        public async Task<IActionResult> GetEventParticipants(int eventId)
        {
            var data = await _context.EventRegistration
                .Where(r => r.EventId == eventId)
                .Include(r => r.Student)
                .ThenInclude(s => s!.User)
                .Select(r => new
                {
                    r.EventRegistrationId,
                    r.StudentId,
                    StudentName = r.Student != null && r.Student.User != null ? r.Student.User.Name : null,
                    EnrollmentNo = r.Student != null ? r.Student.EnrollmentNo : null,
                    r.RegistrationDate,
                    AttendanceStatus = _context.Attendances
                        .Where(a => a.EventRegistrationId == r.EventRegistrationId)
                        .Select(a => a.AttendanceStatus)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var participants = data.Select(p => new
            {
                p.EventRegistrationId,
                p.StudentId,
                p.StudentName,
                p.EnrollmentNo,
                p.RegistrationDate,
                p.AttendanceStatus,
                Attended = p.AttendanceStatus == null ? (bool?)null : p.AttendanceStatus == "Present"
            });

            return Ok(participants);
        }

        [HttpGet("event/{eventId}/attendance")]
        public async Task<IActionResult> GetEventAttendance(int eventId)
        {
            var data = await _context.Attendances
                .Include(a => a.EventRegistration)
                .ThenInclude(r => r.Student)
                .Where(a => a.EventRegistration.EventId == eventId)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("student/{studentId}/events")]
        public async Task<IActionResult> GetStudentEvents(int studentId)
        {
            var events = await _context.EventRegistration
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Event)
                .ToListAsync();

            return Ok(events);
        }
        [HttpGet("top-events")]
        public async Task<IActionResult> GetTopEvents()
        {
            var data = await _context.EventRegistration
                .GroupBy(r => r.EventId)
                .Select(g => new
                {
                    EventId = g.Key,
                    TotalRegistrations = g.Count()
                })
                .OrderByDescending(x => x.TotalRegistrations)
                .Take(5)
                .Join(_context.Events,
                      r => r.EventId,
                      e => e.EventId,
                      (r, e) => new
                      {
                          e.EventId,
                          e.Title,
                          e.EventDate,
                          RegistrationCount = r.TotalRegistrations
                      })
                .ToListAsync();

            return Ok(data);
        }
        [HttpGet("event/{eventId}/summary")]
        public async Task<IActionResult> GetEventSummary(int eventId)
        {
            var totalRegistrations = await _context.EventRegistration
                .CountAsync(r => r.EventId == eventId);

            var present = await _context.Attendances
                .Include(a => a.EventRegistration)
                .CountAsync(a => a.EventRegistration.EventId == eventId &&
                                 a.AttendanceStatus == "Present");

            var attendancePercentage = totalRegistrations == 0
                ? 0
                : Math.Round((double)present * 100 / totalRegistrations, 2);

            return Ok(new
            {
                TotalRegistered = totalRegistrations,
                TotalRegistrations = totalRegistrations,
                Attended = present,
                Present = present,
                Absent = totalRegistrations - present,
                AttendancePercentage = attendancePercentage
            });
        }
    }
}