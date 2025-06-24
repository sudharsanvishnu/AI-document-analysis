import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { access } from "fs/promises";

export async function POST() {
  try {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "ingest_textbooks.py"
    );
    const pythonPath = path.join(process.cwd(), "venv", "bin", "python");

    // Check if virtual environment exists, otherwise use system python
    let python = "python3";
    try {
      await access(pythonPath);
      python = pythonPath;
    } catch {
      // Use system python if venv doesn't exist
    }

    const childProcess = spawn(python, [scriptPath], {
      cwd: process.cwd(),
      stdio: "pipe",
    });

    let output = "";
    let error = "";

    childProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    childProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    return new Promise((resolve) => {
      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve(
            NextResponse.json({
              message: "Textbook ingestion completed successfully",
              output,
            })
          );
        } else {
          resolve(
            NextResponse.json(
              {
                error: "Textbook ingestion failed",
                details: error || output,
              },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("Error running ingestion:", error);
    return NextResponse.json(
      { error: "Failed to start ingestion" },
      { status: 500 }
    );
  }
}
