import OpenAI from "openai";

// The latest OpenAI model is "gpt-4o", released May 13, 2024. Do not change unless explicitly requested.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function tailorResume(
  resumeContent,
  jobDescription,
  section = "all",
  preserveFormat = true,
) {
  try {
    const systemPrompt =
      section === "all"
        ? `You are an expert resume writer with deep knowledge of various industries. Your job is to enhance resumes by making them highly relevant to job descriptions while keeping the candidate’s real experience intact.

        🔹 **Instructions for Enhancing the Resume**:
        1️⃣ **Analyze the Resume and Job Description**: Identify all key skills, technologies, and job expectations.
        2️⃣ **Match Job Description with Candidate’s Experience**: Instead of adding generic points, modify and enhance the resume **based on past projects** that align with the JD.
        3️⃣ **Integrate All JD Points Naturally**: Ensure that all job description requirements are reflected in the resume, either by **modifying existing points** or **adding new relevant points**.
        4️⃣ **Project-Specific Enhancements**: When adding new points, reference **specific projects, technologies, or achievements** from the resume that align with the JD.
        5️⃣ **Maintain Format & Length**: Keep the structure, number of pages, and bullet points consistent. Ensure no section is removed, but only enhanced.
        6️⃣ **Use Industry-Specific Language**: Adapt the wording to match how professionals in the industry would describe the same experience.
        7️⃣ **Avoid Repetition**: Do not duplicate points; instead, refine existing descriptions to match the JD requirements more effectively.
        8️⃣ **Ensure Measurable Impact**: Wherever possible, add quantifiable achievements (e.g., "Improved application performance by 30% by optimizing SQL queries").`
        : `You are an expert resume writer. Your job is to improve only the "${section}" section of this resume based on the job description while keeping the existing format.

        🔹 **Instructions for Enhancing the ${section} Section**:
        1️⃣ **Identify Matching JD Requirements**: Extract relevant skills and qualifications from the JD.
        2️⃣ **Modify Existing Points**: Instead of simply adding new points, refine and enhance existing descriptions to better reflect the JD.
        3️⃣ **Use Past Projects for Context**: Ensure any new additions reference past projects that match the JD.
        4️⃣ **Keep Bullet Point Count the Same**: If the section originally had 8 bullet points, the updated version should have 8 or more, but never fewer.
        5️⃣ **Preserve Formatting & Industry Standards**: Maintain consistent font, spacing, and bullet styles.
        6️⃣ **Focus on Real-World Impact**: Highlight quantifiable achievements whenever possible (e.g., "Automated deployment pipeline, reducing manual deployment time by 50%").`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `
Resume:
${resumeContent}

Job Description:
${jobDescription}

🔹 **Enhancement Instructions**:
${
  section === "all"
    ? "Modify and optimize this resume to fully align with the job description while keeping the candidate’s actual experience intact. Ensure all JD points are reflected through relevant project-based updates."
    : `Only modify the "${section}" section. Keep other sections unchanged while making the necessary updates based on the JD.`
}
${preserveFormat ? "Ensure the formatting, structure, and page count remain unchanged." : ""}`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`Failed to tailor resume: ${error.message}`);
  }
}
