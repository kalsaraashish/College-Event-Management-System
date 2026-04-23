using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ClgEventBackendApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/notifications
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var query = _context.Notifications.AsQueryable();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Organizer")
            {
                var userIdStr = User.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                {
                    query = query.Where(n => !n.EventId.HasValue || _context.Events.Any(e => e.EventId == n.EventId.Value && e.OrganizerId == userId));
                }
            }

            var notifications = await query
                .Select(n => new
                {
                    n.NotificationId,
                    n.Title,
                    n.Message,
                    n.EventId,
                    n.CreatedAt,
                    EventTitle = n.EventId.HasValue
                        ? _context.Events.Where(e => e.EventId == n.EventId.Value).Select(e => e.Title).FirstOrDefault()
                        : null
                })
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // POST: api/notifications
        [Authorize(Roles = "Admin,Organizer")]
        [HttpPost]
        public async Task<IActionResult> CreateNotification(Notification notification)
        {
            if (notification.EventId.HasValue)
            {
                var eventData = await _context.Events.FindAsync(notification.EventId.Value);
                if (eventData == null) return NotFound("Event not found");

                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Organizer")
                {
                    var userIdStr = User.FindFirst("UserId")?.Value;
                    if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                    {
                        if (eventData.OrganizerId != userId) return Forbid();
                    }
                }
            }

            notification.CreatedAt = DateTime.Now;

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        // GET: api/notifications/event/{eventId}
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetEventNotifications(int eventId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.EventId == eventId)
                .Select(n => new
                {
                    n.NotificationId,
                    n.Title,
                    n.Message,
                    n.EventId,
                    n.CreatedAt,
                    EventTitle = _context.Events.Where(e => e.EventId == n.EventId).Select(e => e.Title).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // DELETE: api/notifications/{id}
        [Authorize(Roles = "Admin,Organizer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            if (notification.EventId.HasValue)
            {
                var eventData = await _context.Events.FindAsync(notification.EventId.Value);
                if (eventData != null)
                {
                    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                    if (userRole == "Organizer")
                    {
                        var userIdStr = User.FindFirst("UserId")?.Value;
                        if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int userId))
                        {
                            if (eventData.OrganizerId != userId) return Forbid();
                        }
                    }
                }
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}