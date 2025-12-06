# Project Bumblebee 🐝

![Status](https://img.shields.io/badge/Status-Experimental-orange)

> **Speak less, show more.**
> A visual-first AI experiment that communicates primarily through generated imagery rather than text, building a unique visual language with every conversation.

---

## 🧠 How it Works

Bumblebee flips the traditional chatbot script. Instead of generating paragraphs of text, it "thinks" in visuals.

1.  **Interpretation Layer (`gemini-2.5-flash`)**: 
    The user's query is first sent to a reasoning model. Instead of answering directly, this model acts as a "Director". It analyzes the intent and outputs a structured **Thinking JSON** object containing:
    *   `interpretation`: What the user actually wants.
    *   `visualApproach`: How to best visualize the answer (e.g., "a sequential diagram," "a side-by-side comparison," "a metaphorical illustration").
    *   `prompts`: A set of optimized image generation prompts tailored to the visual approach.
    *   `styleConsiderations`: Notes on maintaining visual consistency with previous turns.

2.  **Generation Layer (`gemini-2.5-flash-image`)**:
    The system takes the generated prompts and fires parallel requests to the image generation model (Nano Banana).

3.  **Presentation Layer**:
    The result is delivered as a chat bubble containing a gallery of images. A hidden "Thinking Layer" allows the user to peek behind the curtain and see the AI's reasoning, interpretation, and the exact prompts it used to generate the visuals.

---

## 🛠 Tech Stack

*   **Framework**: [React](https://react.dev/) (v19)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Models**: 
    *   Google Gemini 2.5 Flash (Reasoning)
    *   Google Gemini 2.5 Flash Image (Generation)
*   **SDK**: Google GenAI SDK

---

## ⚡ Core Logic

The heart of Bumblebee is the `getVisualResponse` orchestrator. It manages the two-step "Think then Draw" process, handling context, history, and error states seamlessly.

```typescript
export const getVisualResponse = async (
  prompt: string,
  history: ChatMessage[],
  imageBase64?: string
): Promise<{ images: string[]; thinking: ThinkingData, groundingSources?: GroundingSource[] }> => {
  
  // 1. Get reasoning and prompts from Gemini 2.5 Flash
  const reasoningModel = 'gemini-2.5-flash';
  
  const contents = [
    ...history.flatMap(msg => {
      const parts = (msg.images && msg.images.length > 0)
        ? [{ text: msg.text }, base64ToGenerativePart(msg.images[0])]
        : [{ text: msg.text }];
      return { role: msg.role, parts };
    }),
    { 
      role: 'user', 
      parts: imageBase64 
        ? [{ text: prompt }, base64ToGenerativePart(imageBase64)] 
        : [{ text: prompt }]
    }
  ];

  const reasoningResponse = await ai.models.generateContent({
    model: reasoningModel,
    contents: contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{googleSearch: {}}],
    }
  });

  // ... (JSON Parsing & Error Handling Logic) ...

  // 2. Generate images using Gemini 2.5 Flash Image
  const imageModel = 'gemini-2.5-flash-image';
  const imagePromises = thinking.prompts.map(p => 
    ai.models.generateContent({
      model: imageModel,
      contents: { parts: [{ text: p }] },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    })
  );

  const imageResponses = await Promise.all(imagePromises);

  // ... (Response Formatting) ...
  
  return { images, thinking, groundingSources };
};
```

---

## 👥 Credits & Attribution

**Developed by [Fladry Creative](https://www.fladrycreative.com)**
*   **Robb Fladry** - Lead Developer & Human-in-the-Loop
*   **Contact**: robb@fladrycreative.com

**AI Co-Contributors**
*   **Antigravity** (Google DeepMind) - *Agentic Coding Assistant*
*   **Gemini** (Google) - *Core Intelligence Engine*

---
*This is an AI-assisted development project. We own that.*
