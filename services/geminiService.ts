import { GoogleGenAI, Type } from "@google/genai";
import { GradeResult, ProblemDefinition } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to sanitize response
const cleanText = (text: string | undefined) => text?.trim() || '';

/**
 * Generates a formal system design problem definition from a user topic.
 */
export const generateProblemDefinition = async (topic: string): Promise<ProblemDefinition> => {
  if (!process.env.API_KEY) {
     throw new Error("API Key missing");
  }

  const prompt = `
    Role: Senior System Design Interviewer.
    Task: Create a formal system design problem definition based on the user's requested topic: "${topic}".
    
    Instructions:
    1. Create a professional Title (e.g., "Design a ...").
    2. Write a concise Description (max 2 sentences) outlining the core functional goal and key technical challenges (e.g. scalability, consistency, etc.).
    
    Output Format: JSON only.
    {
      "title": "string",
      "description": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             title: { type: Type.STRING },
             description: { type: Type.STRING }
          },
          required: ['title', 'description']
        }
      }
    });
    
    const text = cleanText(response.text);
    const parsed = JSON.parse(text);
    return {
      id: Date.now().toString(),
      title: parsed.title,
      description: parsed.description
    };
  } catch (e) {
    console.error("Error generating problem definition", e);
    // Fallback if AI fails
    return {
      id: Date.now().toString(),
      title: `Design ${topic}`,
      description: `Design a system for ${topic}. Focus on requirements, scale, and data models.`
    };
  }
};

/**
 * Analyzes a specific section of the system design interview.
 * It acts as an interviewer, checking for missing obvious points.
 */
export const analyzeSectionContent = async (
  problemContext: string,
  sectionTitle: string,
  sectionDescription: string,
  userContent: string
): Promise<{ status: 'PASS' | 'FEEDBACK'; message: string }> => {
  if (!process.env.API_KEY) {
    return { status: 'FEEDBACK', message: 'API Key is missing. Please check your environment configuration.' };
  }

  try {
    const prompt = `
      Role: You are a strict but helpful Senior System Design Interviewer.
      Context: The candidate is designing the following system: "${problemContext}".
      Task: Evaluate the candidate's answer for the section: "${sectionTitle}".
      Section Description: ${sectionDescription}
      
      Candidate's Answer: "${userContent}"
      
      Instructions:
      1. Check if the candidate missed any OBVIOUS or CRITICAL points specific to "${problemContext}" for this stage.
      2. If the answer is reasonably complete for a high-level interview (covers 80% of basics), return strictly the string "PASS".
      3. If there are significant gaps, major omissions, or lack of clarity, provide a short, single-paragraph guiding response. Ask a specific question to nudge them in the right direction (e.g., "You didn't mention how to handle high availability for the Chat service...").
      4. Do NOT simply answer the question for them. Guide them.
      5. Do NOT return JSON. Return plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const text = cleanText(response.text);

    if (text.includes('PASS') && text.length < 10) {
      return { status: 'PASS', message: 'Looks good! Move to the next section.' };
    }

    return { status: 'FEEDBACK', message: text };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { status: 'FEEDBACK', message: 'Error analyzing content. Please try again.' };
  }
};

/**
 * Returns the missing key points or solution for a specific section when the user gives up.
 */
export const getSectionMissedPoints = async (
  problemContext: string,
  sectionTitle: string,
  sectionDescription: string,
  userContent: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return 'API Key is missing.';
  }

  try {
    const prompt = `
      Role: Senior System Design Interviewer.
      Context: The candidate is designing: "${problemContext}".
      Task: The candidate has asked for help on the section: "${sectionTitle}".
      Section Description: ${sectionDescription}
      Candidate's Current Draft: "${userContent}"

      Instructions:
      1. Provide a concise bulleted list of the KEY points that *should* be included in this section to pass.
      2. If the candidate wrote something, specifically highlight what they missed.
      3. Be direct and educational. This is the "solution" phase for this section.
      
      Keep it under 300 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 1500,
        temperature: 0.5,
      },
    });

    return cleanText(response.text);

  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return 'Could not retrieve solution. Please try again.';
  }
};

/**
 * Grades the entire interview session.
 */
export const gradeInterviewSession = async (
  problemContext: string,
  sections: { title: string; content: string }[]
): Promise<GradeResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  try {
    const prompt = `
      Role: Senior System Design Interviewer.
      Context: The candidate is designing: "${problemContext}".
      Task: Grade the candidate's full system design interview performance.
      
      Candidate's Submission:
      ${JSON.stringify(sections, null, 2)}
      
      Instructions:
      1. Analyze the coherence, technical depth, and completeness of the entire design for "${problemContext}".
      2. Provide a score from 0 to 100.
      3. Provide a summary of performance.
      4. List specific strengths.
      5. List specific weaknesses.
      
      Output Format: JSON only, matching this schema:
      {
        "score": number,
        "summary": "string",
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['score', 'summary', 'strengths', 'weaknesses']
        }
      },
    });

    const text = cleanText(response.text);
    return JSON.parse(text) as GradeResult;

  } catch (error) {
    console.error("Gemini Grading Error:", error);
    return {
      score: 0,
      summary: "Failed to generate grade due to an error.",
      strengths: [],
      weaknesses: ["System error occurred during grading."],
    };
  }
};