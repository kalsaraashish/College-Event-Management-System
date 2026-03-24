using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var notifications = await _context.Notifications
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
        [HttpPost]
        public async Task<IActionResult> CreateNotification(Notification notification)
        {
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}