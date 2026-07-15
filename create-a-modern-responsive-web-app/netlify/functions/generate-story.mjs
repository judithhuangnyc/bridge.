/**
 * Server-only Gemini proxy. GEMINI_API_KEY is read by Netlify at runtime and
 * is never returned to, bundled with, or otherwise exposed to the browser.
 */
export default async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "Bridge AI is not configured yet." }, { status: 503 });

  try {
    const { story, purpose } = await request.json();
    if (typeof story !== "string" || story.trim().length < 10) return Response.json({ error: "Please add a little more of your story before continuing." }, { status: 400 });
    if (story.length > 15000) return Response.json({ error: "Please keep your story under 15,000 characters." }, { status: 400 });

    const prompt = `You are Bridge, a careful writing assistant for crisis-affected learners. Rewrite ONLY the user's supplied story. Preserve the writer's authentic voice, emotional meaning, and all facts. Correct grammar and improve clarity, but NEVER add, assume, exaggerate, or invent facts, achievements, names, dates, locations, motivations, or outcomes. Do not mention being an AI.

The learner's intended use is: ${typeof purpose === "string" && purpose ? purpose : "general storytelling"}.

Return valid JSON only, with exactly these keys: clear, ngo, professional. Each value must be a polished, self-contained English version of the same story. Keep each response concise (one or two paragraphs). The NGO version should appropriately emphasize community context and needs without inventing details. The professional version should appropriately emphasize transferable strengths without inventing details.

USER STORY:
${story.trim()}`;

    const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });
    if (!geminiResponse.ok) {
      console.error("Gemini error", geminiResponse.status, await geminiResponse.text());
      return Response.json({ error: "Bridge could not create a version right now. Please try again." }, { status: 502 });
    }
    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    const versions = JSON.parse(text);
    if (!["clear", "ngo", "professional"].every((key) => typeof versions[key] === "string")) throw new Error("Unexpected Gemini response format");
    return Response.json({ versions });
  } catch (error) {
    console.error("Story generation failed", error);
    return Response.json({ error: "Bridge could not understand that response. Please try again." }, { status: 500 });
  }
};
