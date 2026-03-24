using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Authorize(Roles = "Student")]
    [Route("api/student/profile")]
    [ApiController]
    public class StudentProfileController : ControllerBase
    {
        public class CompleteStudentProfileDto
        {
            [Required]
            [MaxLength(50)]
            public string EnrollmentNo { get; set; } = string.Empty;

            [Required]
            [MaxLength(50)]
            public string Course { get; set; } = string.Empty;

            [Range(1, 10)]
            public int Year { get; set; }

            [Required]
            [MaxLength(20)]
            public string Phone { get; set; } = string.Empty;
        }

        private readonly AppDbContext _context;

        public StudentProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CompleteProfile(CompleteStudentProfileDto model)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                return NotFound("User not found");

            if (user.Status != "Approved")
                return BadRequest("Your account is waiting for admin approval.");

            if (user.Student != null)
                return BadRequest("Student profile already exists");

            var enrollmentExists = await _context.Students
                .AnyAsync(s => s.EnrollmentNo == model.EnrollmentNo);

            if (enrollmentExists)
                return BadRequest("Enrollment number already exists");

            var student = new Student
            {
                UserId = userId,
                EnrollmentNo = model.EnrollmentNo,
                Course = model.Course,
                Year = model.Year,
                Phone = model.Phone
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Student profile completed successfully",
                student.StudentId,
                student.UserId,
                student.EnrollmentNo,
                student.Course,
                student.Year,
                student.Phone
            });
        }
    }
}