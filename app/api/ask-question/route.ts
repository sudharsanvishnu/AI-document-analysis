import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required and must be a string" },
        { status: 400 }
      );
    }

    // Use Python script to answer question using embeddings
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "answer_question.py"
    );
    const pythonPath = path.join(process.cwd(), "venv", "bin", "python");

    return new Promise((resolve) => {
      const pythonProcess = spawn(pythonPath, [scriptPath, question]);

      let output = "";
      let errorOutput = "";
      let isResolved = false;

      // Set timeout for the process (2 minutes)
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          pythonProcess.kill();
          resolve(
            NextResponse.json(
              {
                error:
                  "Request timed out. The AI is taking too long to respond.",
              },
              { status: 504 }
            )
          );
        }
      }, 120000); // 2 minutes timeout

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeout);

        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(NextResponse.json({ answer: result.answer }));
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Python output:", output);
            resolve(
              NextResponse.json(
                { error: "Failed to parse response from AI" },
                { status: 500 }
              )
            );
          }
        } else {
          console.error("Python script error:", errorOutput);
          console.error("Python script exit code:", code);
          resolve(
            NextResponse.json(
              {
                error:
                  "Failed to generate answer. Make sure you have uploaded and processed documents first.",
              },
              { status: 500 }
            )
          );
        }
      });

      pythonProcess.on("error", (error) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeout);
        console.error("Python process error:", error);
        resolve(
          NextResponse.json(
            { error: "Failed to start Python process" },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error("Error in ask-question API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
