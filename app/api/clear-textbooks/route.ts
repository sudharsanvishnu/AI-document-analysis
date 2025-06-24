import { NextResponse } from "next/server";
import { rm } from "fs/promises";
import path from "path";

export async function DELETE() {
  try {
    const textbooksDir = path.join(process.cwd(), "data", "textbooks");
    const embeddingsDir = path.join(process.cwd(), "embeddings", "faiss_index");

    const clearOperations = [];

    // Clear textbooks directory
    clearOperations.push(
      rm(textbooksDir, { recursive: true, force: true }).catch(() => {
        console.log("No textbooks directory to clear");
      })
    );

    // Clear embeddings/chunks
    clearOperations.push(
      rm(embeddingsDir, { recursive: true, force: true }).catch(() => {
        console.log("No embeddings directory to clear");
      })
    );

    await Promise.all(clearOperations);

    console.log("Textbooks and chunks cleared successfully");

    return NextResponse.json({
      message: "All textbooks and processed chunks cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing textbooks and chunks:", error);
    return NextResponse.json(
      { error: "Failed to clear textbooks and chunks" },
      { status: 500 }
    );
  }
}
