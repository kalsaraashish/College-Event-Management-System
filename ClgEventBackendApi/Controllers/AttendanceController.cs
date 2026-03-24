using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        public class MarkAttendanceDto
        {
            public int EventRegistrationId { get; set; }
            public string AttendanceStatus { get; set; } = "Absent";
        }

        public class BulkMarkAttendanceDto
        {
            public int EventId { get; set; }
            public string Status { get; set; } = "Absent";
            public List<int> RegistrationIds { get; set; } = new();
        }

        private readonly AppDbContext _context;

        public AttendanceController(AppDbContext context)
        {
            _context = context;
        }

        // ===============================
        // POST: api/attendance
        // Mark attendance for one student
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> MarkAttendance(MarkAttendanceDto attendance)
        {
            var registration = await _context.EventRegistration
                .FindAsync(attendance.EventRegistrationId);

            if (registration == null)
                return BadRequest("Invalid Event Registration ID");

            var exists = await _context.Attendances
                .AnyAsync(a => a.EventRegistrationId == attendance.EventRegistrationId);

            if (exists)
                return BadRequest("Attendance already marked");

            var attendanceEntity = new Attendance
            {
                EventRegistrationId = attendance.EventRegistrationId,
                AttendanceStatus = attendance.AttendanceStatus,
                MarkedAt = DateTime.Now
            };

            _context.Attendances.Add(attendanceEntity);
            await _context.SaveChangesAsync();

            return Ok(attendanceEntity);
        }

        // ===============================
        // PUT: api/attendance/{id}
        // Update attendance
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAttendance(int id, MarkAttendanceDto attendance)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.AttendanceId == id);

            if (existing == null)
                return NotFound("Attendance record not found");

            if (attendance.EventRegistrationId > 0 && existing.EventRegistrationId != attendance.EventRegistrationId)
                return BadRequest("Registration mismatch for attendance record");

            existing.AttendanceStatus = attendance.AttendanceStatus;
            existing.MarkedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        // ===============================
        // POST: api/attendance/mark-bulk
        // Mark attendance in bulk for an event
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpPost("mark-bulk")]
        public async Task<IActionResult> MarkAttendanceBulk(BulkMarkAttendanceDto request)
        {
            if (request.EventId <= 0 || request.RegistrationIds == null || request.RegistrationIds.Count == 0)
                return BadRequest("Event and registrations are required");

            var validRegistrationIds = await _context.EventRegistration
                .Where(r => r.EventId == request.EventId && request.RegistrationIds.Contains(r.EventRegistrationId))
                .Select(r => r.EventRegistrationId)
                .ToListAsync();

            if (validRegistrationIds.Count == 0)
                return BadRequest("No valid registrations found for event");

            var existingAttendances = await _context.Attendances
                .Where(a => validRegistrationIds.Contains(a.EventRegistrationId))
                .ToListAsync();

            foreach (var regId in validRegistrationIds)
            {
                var existing = existingAttendances.FirstOrDefault(a => a.EventRegistrationId == regId);
                if (existing == null)
                {
                    _context.Attendances.Add(new Attendance
                    {
                        EventRegistrationId = regId,
                        AttendanceStatus = request.Status,
                        MarkedAt = DateTime.Now
                    });
                }
                else
                {
                    existing.AttendanceStatus = request.Status;
                    existing.MarkedAt = DateTime.Now;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Bulk attendance marked successfully",
                updatedCount = validRegistrationIds.Count
            });
        }

        // ===============================
        // GET: api/attendance/event/{eventId}
        // Get attendance by event
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetAttendanceByEvent(int eventId)
        {
            var data = await _context.Attendances
                .Include(a => a.EventRegistration)
                .ThenInclude(r => r.Event)
                .Where(a => a.EventRegistration.EventId == eventId)
                .ToListAsync();

            return Ok(data);
        }

        // ===============================
        // GET: api/attendance/event/{eventId}/summary
        // Attendance summary for selected event
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet("event/{eventId}/summary")]
        public async Task<IActionResult> GetAttendanceSummary(int eventId)
        {
            var totalRegistered = await _context.EventRegistration
                .CountAsync(r => r.EventId == eventId && r.Status != "Cancelled");

            var attendanceForEvent = await _context.Attendances
                .Where(a => a.EventRegistration.EventId == eventId)
                .ToListAsync();

            var presentCount = attendanceForEvent.Count(a => a.AttendanceStatus == "Present");
            var absentCount = attendanceForEvent.Count(a => a.AttendanceStatus == "Absent");
            var lateCount = attendanceForEvent.Count(a => a.AttendanceStatus == "Late");

            var attendancePercentage = totalRegistered == 0
                ? 0
                : Math.Round((double)presentCount * 100 / totalRegistered, 2);

            return Ok(new
            {
                totalRegistered,
                presentCount,
                absentCount,
                lateCount,
                attendancePercentage
            });
        }
    }
}