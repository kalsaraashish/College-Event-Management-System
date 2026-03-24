using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClgEventBackendApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRegistrationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_Registrations_RegistrationId",
                table: "Attendances");

            migrationBuilder.DropForeignKey(
                name: "FK_EventRegistration_Users_StudentId",
                table: "EventRegistration");

            migrationBuilder.DropTable(
                name: "Registrations");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_RegistrationId",
                table: "Attendances");

            migrationBuilder.RenameColumn(
                name: "RegistrationId",
                table: "Attendances",
                newName: "EventRegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EventRegistrationId",
                table: "Attendances",
                column: "EventRegistrationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_EventRegistration_EventRegistrationId",
                table: "Attendances",
                column: "EventRegistrationId",
                principalTable: "EventRegistration",
                principalColumn: "EventRegistrationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventRegistration_Students_StudentId",
                table: "EventRegistration",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "StudentId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_EventRegistration_EventRegistrationId",
                table: "Attendances");

            migrationBuilder.DropForeignKey(
                name: "FK_EventRegistration_Students_StudentId",
                table: "EventRegistration");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_EventRegistrationId",
                table: "Attendances");

            migrationBuilder.RenameColumn(
                name: "EventRegistrationId",
                table: "Attendances",
                newName: "RegistrationId");

            migrationBuilder.CreateTable(
                name: "Registrations",
                columns: table => new
                {
                    RegistrationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Registrations", x => x.RegistrationId);
                    table.ForeignKey(
                        name: "FK_Registrations_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Registrations_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "StudentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_RegistrationId",
                table: "Attendances",
                column: "RegistrationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_EventId",
                table: "Registrations",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_StudentId",
                table: "Registrations",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_Registrations_RegistrationId",
                table: "Attendances",
                column: "RegistrationId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventRegistration_Users_StudentId",
                table: "EventRegistration",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
