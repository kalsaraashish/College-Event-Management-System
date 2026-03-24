using ClgEventBackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        // ===============================
        // 1️⃣ Get all students (Admin only)
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetStudent()
        {
            var students = await _context.Students
                .Include(s => s.User)
                .ToListAsync();

            return Ok(students);
        }

        // ===============================
        // 2️⃣ Get student by ID (Admin only)
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudentById(int id)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == id);

            if (student == null)
                return NotFound("Student not found");

            return Ok(student);
        }

        // ===============================
        // 3️⃣ Create student (Admin only)
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateStudent(Student student)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudentById), new { id = student.StudentId }, student);
        }

        // ===============================
        // 4️⃣ Update student (Admin only)
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, Student student)
        {
            if (id != student.StudentId)
                return BadRequest("Student ID mismatch");

            if (!await _context.Students.AnyAsync(s => s.StudentId == id))
                return NotFound("Student not found");

            _context.Entry(student).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok(student);
        }

        // ===============================
        // 5️⃣ Delete student (Admin only)
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);

            if (student == null)
                return NotFound("Student not found");

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return Ok("Student deleted successfully");
        }

        // ===============================
        // 6️⃣ Get student by UserId (Student only)
        // ===============================
        [Authorize(Roles = "Student")]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetStudentByUserId(int userId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound("Student not found");

            return Ok(student);
        }
    }
}