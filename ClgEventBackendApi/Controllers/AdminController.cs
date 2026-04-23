using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var pendingUsers = await _context.Users
                .Where(u => (u.Role == "Student" || u.Role == "Organizer") && u.Status == "Pending")
                .OrderBy(u => u.CreatedAt)
                .Select(u => new
                {
                    u.UserId,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Status,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(pendingUsers);
        }

        [HttpPut("approve-user/{userId:int}")]
        public async Task<IActionResult> ApproveUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound("User not found");

            if (user.Role != "Student" && user.Role != "Organizer")
                return BadRequest("Only student or organizer accounts can be approved");

            user.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User approved successfully",
                user.UserId,
                user.Name,
                user.Email,
                user.Role,
                user.Status
            });
        }
    }
}