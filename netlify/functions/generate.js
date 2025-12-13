import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async (req) => {
  const { topic, customDialogue, durationMinutes, allowVariations } =
    JSON.parse(req.body);

  const model = "gemini-2.5-flash";
  const targetSceneCount = Math.max(1, Math.round(durationMinutes * 6));

  // ===== STORY DRAFT =====
  const storyPrompt = `
Write a narrative story based on this topic: "${topic}".
The story MUST be split into exactly ${targetSceneCount} scenes of 10 seconds each.
${customDialogue ? `Include this dialogue: "${customDialogue}"` : ""}
`;

  const storyRes = await ai.models.generateContent({
    model,
    contents: storyPrompt,
  });

  const storyText = storyRes.text;

  // ===== SCENE GENERATION =====
  const scenePrompt = `
Split the story into EXACTLY ${targetSceneCount} scenes.
Output JSON only.
`;

  const sceneRes = await ai.models.generateContent({
    model,
    contents: scenePrompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const scenes = JSON.parse(sceneRes.text);

  // ===== AUTO VALIDATOR =====
  const cleanScenes = scenes.map((s, i) => ({
    scene_number: i + 1,
    duration_seconds: 10,
    setting_description: s.setting_description || "",
    character_appearance: s.character_appearance || "",
    action_description: s.action_description || "",
    dialogue: s.dialogue || "",
    camera_angle: s.camera_angle || "Wide Shot",
    lighting: s.lighting || "Natural",
    mood: s.mood || "Neutral",
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ scenes: cleanScenes }),
  };
};
