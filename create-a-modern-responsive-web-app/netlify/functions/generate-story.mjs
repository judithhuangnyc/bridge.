/**
 * Server-only AI proxy. Provider credentials are read by Netlify at runtime
 * and are never returned to, bundled with, or exposed to the browser.
 */
export default async (request) => {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!geminiApiKey && !openAiApiKey) return Response.json({ error: "Bridge AI is not configured yet." }, { status: 503 });
  const geminiBaseUrl = (process.env.GOOGLE_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
  const openAiBaseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");

  try {
    const { story, purpose } = await request.json();
    if (typeof story !== "string" || story.trim().length < 10) return Response.json({ error: "Please add a little more of your story before continuing." }, { status: 400 });
    if (story.length > 15000) return Response.json({ error: "Please keep your story under 15,000 characters." }, { status: 400 });

    const prompt = `You are Bridge, a careful writing assistant for crisis-affected learners. Rewrite ONLY the user's supplied story. Preserve the writer's authentic voice, emotional meaning, and all facts. Correct grammar and improve clarity, but NEVER add, assume, exaggerate, or invent facts, achievements, names, dates, locations, motivations, or outcomes. Do not mention being an AI.

The learner's intended use is: ${typeof purpose === "string" && purpose ? purpose : "general storytelling"}.

Return valid JSON only, with exactly these keys: clear, ngo, professional. Each value must be a polished, self-contained English version of the same story. Keep each response concise (one or two paragraphs). The NGO version should appropriately emphasize community context and needs without inventing details. The professional version should appropriately emphasize transferable strengths without inventing details.

USER STORY:
${story.trim()}`;

    const hasVersions = (versions) => ["clear", "ngo", "professional"].every((key) => typeof versions?.[key] === "string");

    const requestGeminiVersions = async (model) => {
      if (!geminiApiKey) return { status: 0 };
      try {
        const geminiResponse = await fetch(`${geminiBaseUrl}/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": geminiApiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!geminiResponse.ok) {
          console.error("Gemini error", model, geminiResponse.status);
          return { status: geminiResponse.status };
        }
        const geminiData = JSON.parse(await geminiResponse.text());
        const text = geminiData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
        const parsedVersions = JSON.parse(text);
        if (!hasVersions(parsedVersions)) throw new Error("Unexpected Gemini response format");
        return { status: geminiResponse.status, versions: parsedVersions };
      } catch (error) {
        console.error("Gemini model failed", model, error);
        return { status: 0 };
      }
    };

    const requestOpenAiVersions = async () => {
      if (!openAiApiKey) return { status: 0 };
      try {
        const openAiResponse = await fetch(`${openAiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openAiApiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!openAiResponse.ok) {
          console.error("OpenAI fallback error", openAiResponse.status);
          return { status: openAiResponse.status };
        }
        const openAiData = JSON.parse(await openAiResponse.text());
        const parsedVersions = JSON.parse(openAiData.choices?.[0]?.message?.content || "");
        if (!hasVersions(parsedVersions)) throw new Error("Unexpected OpenAI response format");
        return { status: openAiResponse.status, versions: parsedVersions };
      } catch (error) {
        console.error("OpenAI fallback failed", error);
        return { status: 0 };
      }
    };

    let result = await requestGeminiVersions("gemini-2.5-flash");
    if (result.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      result = await requestGeminiVersions("gemini-2.5-flash");
    }

    if (!result.versions) result = await requestOpenAiVersions();
    if (!result.versions) return Response.json({ error: "Bridge could not create a version right now. Please try again." }, { status: 502 });
    return Response.json({ versions: result.versions });
  } catch (error) {
    console.error("Story generation failed", error);
    return Response.json({ error: "Bridge could not understand that response. Please try again." }, { status: 500 });
  }
};
