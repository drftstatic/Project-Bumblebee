# Project Bumblebee 🐝

[![Status](https://img.shields.io/badge/Status-Experimental-orange)](https://github.com/drftstatic/Project-Bumblebee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-91.4%25-blue)](https://www.typescriptlang.org/)

**Speak less, show more.** A visual-first AI experiment that communicates primarily through generated imagery rather than text, building a unique visual language with every conversation.

🔗 **Live Demo**: [bumblebee.fladrycreative.com](http://bumblebee.fladrycreative.com/)

---

## 🎯 Project Overview

Project Bumblebee is an experimental AI interface that inverts the traditional text-heavy chatbot paradigm. Instead of generating walls of text, Bumblebee "thinks" visually—translating user queries into a sequence of meaningful images using Google's Gemini multimodal AI models.

The project explores a fundamental question: **What if AI communicated primarily through images, developing its own visual language over time?** This concept draws inspiration from linguistic relativity theory and films like *Arrival*, where understanding emerges through visual and conceptual patterns rather than verbal language.

### What Makes This Different?

Unlike DALL-E chat or other multimodal systems that use images as supplements to text responses, Bumblebee:

- **Only thinks in images**: The model cannot respond with text alone—every output is visual
- - **Develops visual language**: Over conversation turns, establishes consistent visual metaphors and styles
  - - **Shows its reasoning**: A transparent "Thinking Layer" reveals how the AI interprets queries and plans visuals
    - - **Two-stage architecture**: Separates reasoning (interpretation) from generation (visualization)
     
      - This isn't about generating prettier responses—it's about exploring whether visual-first communication can be more intuitive, universal, or expressive than text for certain tasks.
     
      - ---

      ## 🧠 How It Works

      Bumblebee flips the traditional chatbot script through a three-layer architecture:

      ### 1. **Interpretation Layer** (`gemini-2.5-flash`)
      The user's query is first sent to a reasoning model. Instead of answering directly, this model acts as a "Director." It analyzes the intent and outputs a structured **Thinking JSON** object containing:

      - `interpretation`: What the user actually wants
      - `visualApproach`: How to best visualize the answer (e.g., "a sequential diagram," "a side-by-side comparison," "a metaphorical illustration")
      - `prompts`: A set of optimized image generation prompts tailored to the visual approach
      - `styleConsiderations`: Notes on maintaining visual consistency with previous turns
           
      - ### 2. **Generation Layer** (`gemini-2.5-flash-image`)
      - The system takes the generated prompts and fires parallel requests to the image generation model.
           
      - **Model Note**: This uses Google Gemini's experimental image generation model, internally nicknamed "Nano Banana" (now evolved to "Nano Banana Pro" in the gemini-3.0-flash-image-preview). This detail represents the bleeding edge of Google's multimodal capabilities.
           
       - ### 3. **Presentation Layer**
       - The result is delivered as a chat bubble containing a gallery of images. A hidden **"Thinking Layer"** allows the user to peek behind the curtain and see the AI's reasoning, interpretation, and the exact prompts it used to generate the visuals.
           
       - ---

            ## 🛠 Tech Stack

            | Component | Technology |
            |-----------|-----------|
            | **Framework** | [React](https://react.dev/) (v19) |
            | **Build Tool** | [Vite](https://vitejs.dev/) |
            | **Language** | [TypeScript](https://www.typescriptlang.org/) |
            | **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
            | **AI Models** | Google Gemini 2.5 Flash (Reasoning)<br>Google Gemini 2.5 Flash Image (Generation) |
            | **SDK** | Google GenAI SDK |

            ---

            ## ⚙️ Getting Started

            ### Prerequisites

            - Node.js (v18 or higher)
            - - Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
             
              - ### Installation
             
              - 1. **Clone the repository**
                2.    ```bash
                         git clone https://github.com/drftstatic/Project-Bumblebee.git
                         cd Project-Bumblebee
                         ```

                      2. **Install dependencies**
                      3.    ```bash
                               npm install
                               ```

                            3. **Set up environment variables**
                        
                            4.       Copy the example environment file:
                            5.      ```bash
                            6.     cp .env.example .env
                            7.    ```

                                     Then edit `.env` and add your API key:
                                     ```
                                     GEMINI_API_KEY=your_actual_gemini_api_key_here
                                 ```

                              4. **Run the development server**
                              5.    ```bash
                                       npm run dev
                                       ```

                                    5. **Open your browser**
                                
                                    6.       Navigate to `http://localhost:5173` (or the port shown in your terminal)
                                
                                    7.   ---
                                
                                    8.   ## ⚡ Core Logic
                                
                                    9.   The heart of Bumblebee is the `getVisualResponse` orchestrator. It manages the two-step "Think then Draw" process, handling context, history, and error states seamlessly.
                                
                                    10.   ```typescript
                                          export const getVisualResponse = async (
                                            prompt: string,
                                            history: ChatMessage[],
                                            imageBase64?: string
                                          ): Promise<{
                                            images: string[];
                                            thinking: ThinkingData;
                                            groundingSources?: GroundingSource[];
                                          }> => {
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
                                                tools: [{ googleSearch: {} }],
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

                                          ## 🔬 Research Context

                                          This project was built to understand how AI "thinks" when it generates images. The visual language concept is inspired by the linguistic challenges in Denis Villeneuve's *Arrival*—where aliens communicate through complex circular visual symbols rather than linear spoken language.

                                          ### Potential Applications

                                          - **Education**: Visual explanations for complex concepts
                                          - - **Accessibility**: Communication aid for visual learners or non-verbal individuals
                                            - - **Creative Workflows**: Ideation and concept visualization for designers
                                              - - **Cross-cultural Communication**: Images as a more universal language
                                               
                                                - ### Limitations
                                               
                                                - - **Early Stage**: This is experimental research, not production-ready
                                                  - - **Image Generation Costs**: Each response generates multiple images via API
                                                    - - **Reasoning Transparency**: While the "Thinking Layer" exposes the process, interpreting AI reasoning remains challenging
                                                      - - **Visual Consistency**: Maintaining style across turns is difficult without fine-tuning
                                                       
                                                        - ---

                                                        ## 📁 Project Structure

                                                        ```
                                                        Project-Bumblebee/
                                                        ├── components/          # React components (ChatBubble, ThinkingLayer, etc.)
                                                        ├── services/            # API service layer (Gemini integration)
                                                        ├── App.tsx             # Main application component
                                                        ├── constants.ts        # System prompts and configuration
                                                        ├── types.ts            # TypeScript interfaces
                                                        ├── .env.example        # Example environment variables
                                                        └── README.md           # You are here
                                                        ```

                                                        ---

                                                        ## 🤝 Contributing

                                                        This is an open research project. Contributions, ideas, and feedback are welcome!

                                                        1. Fork the repository
                                                        2. 2. Create a feature branch (`git checkout -b feature/amazing-idea`)
                                                           3. 3. Commit your changes (`git commit -m 'Add amazing idea'`)
                                                              4. 4. Push to the branch (`git push origin feature/amazing-idea`)
                                                                 5. 5. Open a Pull Request
                                                                   
                                                                    6. ---
                                                                   
                                                                    7. ## 📄 License
                                                                   
                                                                    8. This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
                                                                   
                                                                    9. ---
                                                                   
                                                                    10. ## 👥 Credits & Attribution
                                                                   
                                                                    11. **Developed by** [Fladry Creative](https://www.fladrycreative.com)
                                                                   
                                                                    12. - **Robb Fladry** - Lead Developer & Human-in-the-Loop
                                                                        - - **Contact**: [robb@fladrycreative.com](mailto:robb@fladrycreative.com)
                                                                         
                                                                          - ### AI Co-Contributors
                                                                         
                                                                          - - **Antigravity** (Google DeepMind) - Agentic Coding Assistant
                                                                            - - **Gemini** (Google) - Core Intelligence Engine
                                                                             
                                                                              - **This is an AI-assisted development project. We own that.**
                                                                             
                                                                              - ---

                                                                              ## 🔮 Future Directions

                                                                              - [ ] Fine-tune visual consistency across conversation turns
                                                                              - [ ] - [ ] Add support for video generation (Gemini Video models)
                                                                              - [ ] - [ ] Implement user-defined visual "style profiles"
                                                                              - [ ] - [ ] Explore chain-of-thought visualization for complex reasoning
                                                                              - [ ] - [ ] Build comparison metrics vs. text-only explanations
                                                                             
                                                                              - [ ] ---
                                                                             
                                                                              - [ ] ## 📚 Citation
                                                                             
                                                                              - [ ] If you reference this project in academic work or research, please use:
                                                                             
                                                                              - [ ] ```bibtex
                                                                              @software{fladry2025bumblebee,
  author = {Fladry, Robb},
  title = {Project Bumblebee: A Visual-First AI Communication Experiment},
               
    year = {2025},  url = {https://github.com/drftstatic/Project-Bumblebee},
      note = {Experimental multimodal AI interface using Google Gemini}
    }
    ```

    ---

    **Questions? Issues? Ideas?** Open an issue or reach out at [robb@fladrycreative.com](mailto:robb@fladrycreative.com)
