import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { formFields, jobDescription, userProfile } = await request.json();

    if (!formFields || !userProfile) {
      return NextResponse.json(
        { error: "Missing form fields or user profile" },
        { status: 400 }
      );
    }

    const systemPrompt = `You write professional job application answers. Keep them concise and genuine.

RULES:
1. Keep answers to 1-2 SHORT sentences (25-40 words max)
2. Be direct and professional
3. NEVER use dashes, semicolons, or colons
4. NEVER use buzzwords like "passionate", "driven", "leverage", "synergy", "utilize"
5. Use contractions naturally (I've, I'm, it's)
6. Reference the specific company or role when relevant
7. Focus on concrete skills and experiences
8. Sound confident but not arrogant
9. Return ONLY valid JSON, no other text`;

    const userPrompt = `
CANDIDATE PROFILE:
${JSON.stringify(userProfile, null, 2)}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

FORM FIELDS TO FILL:
${JSON.stringify(formFields, null, 2)}

For each form field, provide the best value from the candidate's profile or generate an appropriate response.

Return a JSON object where keys are the field identifiers and values are what should be filled in.
Example format: {"field_name": "value to fill", "field_email": "email@example.com"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    // Parse JSON from response (handle markdown code blocks)
    let filledData;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                        responseText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      filledData = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse AI response:", responseText);
      filledData = {};
    }

    return NextResponse.json({
      success: true,
      filledData,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("AI autofill error:", error);
    return NextResponse.json(
      { error: "Failed to generate autofill data" },
      { status: 500 }
    );
  }
}
