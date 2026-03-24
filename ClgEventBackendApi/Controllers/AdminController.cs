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

        [HttpGet("pending-students")]
        public async Task<IActionResult> GetPendingStudents()
        {
            var pendingStudents = await _context.Users
                .Where(u => u.Role == "Student" && u.Status == "Pending")
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

            return Ok(pendingStudents);
        }

        [HttpPut("approve-student/{userId:int}")]
        public async Task<IActionResult> ApproveStudent(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound("User not found");

            if (user.Role != "Student")
                return BadRequest("Only student accounts can be approved");

            user.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Student approved successfully",
                user.UserId,
                user.Name,
                user.Email,
                user.Status
            });
        }
    }
}