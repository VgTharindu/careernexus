const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const scoreCV = async (cvText, jobTitle, jobDescription, jobSkills) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an expert HR recruiter. Analyse this student CV against the job requirements and provide a match score.

JOB DETAILS:
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${jobSkills || "Not specified"}

STUDENT CV:
${cvText}

Respond in this exact JSON format only. No markdown, no backticks, no extra text:
{
  "score": <number from 0 to 100>,
  "feedback": [
    "<strength point 1>",
    "<strength point 2>",
    "<gap or improvement point>"
  ],
  "summary": "<one sentence overall assessment>"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean response in case Gemini adds markdown backticks
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("AI scoring error:", error);
    // Return default if AI fails — app still works
    return {
      score: 50,
      feedback: ["AI scoring temporarily unavailable"],
      summary: "Please review this application manually",
    };
  }
};

module.exports = { scoreCV };
