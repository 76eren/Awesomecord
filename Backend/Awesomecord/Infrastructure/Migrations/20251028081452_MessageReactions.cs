using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MessageReactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "reactedToMessageId",
                table: "Messages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_reactedToMessageId",
                table: "Messages",
                column: "reactedToMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Messages_reactedToMessageId",
                table: "Messages",
                column: "reactedToMessageId",
                principalTable: "Messages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Messages_reactedToMessageId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_reactedToMessageId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "reactedToMessageId",
                table: "Messages");
        }
    }
}
