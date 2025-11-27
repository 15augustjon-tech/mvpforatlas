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

    const systemPrompt = `You write job application answers that sound like a real college student wrote them. Your goal is to pass AI detection.

CRITICAL RULES FOR HUMAN SOUNDING TEXT:
1. Keep answers SHORT (2 sentences max, around 30 words)
2. NEVER use dashes, semicolons, or colons in your writing
3. NEVER use words like "passionate", "driven", "thrive", "leverage", "utilize", "foster"
4. NEVER start with "I am" or "I'm excited"
5. Use casual contractions like "I've", "it's", "that's"
6. Write like you're texting a friend but slightly more formal
7. Use simple vocabulary, not fancy words
8. Include small imperfections like starting sentences with "So" or "Also"
9. Vary sentence length, mix short and medium sentences
10. Reference specific details from the job or your experience
11. Sound genuinely interested, not overly enthusiastic
12. Return ONLY valid JSON, no other text`;

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
