// ========================================
// Base Agent Module
// Provides common utilities for specialized agents
// ========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

class BaseAgent {
    constructor(name, systemPrompt) {
        this.name = name;
        this.apiKey = process.env.GEMINI_API_KEY;

        // Global Senior Analyst Directives (The "宪법" of the system)
        const globalDirectives = `
## BINDING SOURCES HIERARCHY:
1. **SEC Filings (10-K/10-Q):** GAAP is the bible. If Non-GAAP is used, YOU MUST highlight the bridge (SBC, adjustments).
2. **Earnings Transcripts:** Direct quotes only. No paraphrasing without attribution.
3. **Tier-1 Analysts:** Goldman, Morgan Stanley, etc. (Secondary source only).
4. **News:** WSJ/Bloomberg only for context. NO social media/blogs.

## DEPTH & NARRATIVE (THE "MASTERCARD" STANDARD):
1.  **High Text-to-Data Ratio:** For every data point, write 2-3 paragraphs explaining context, cause, and implication.
2.  **NO BULLET POINTS (Internal):** Use cohesive paragraphs to tell the story.
3.  **The "So What?" Rule:** Never state a number without explaining WHY it matters.
    *   *Bad:* "Revenue grew 10%."
    *   *Good:* "Revenue grew 10%, driven primarily by pricing power, indicating a moat..."
4.  **Plain English:** Explain like you are teaching a smart student. Use analogies.

## TONE & FORMATTING:
1.  **Critical & Skeptical:** Reveal risks. Don't sell.
2.  **Visual Trends:** YOU MUST use arrows (⬆️/⬇️) for ALL trend data.
3.  **Data Display:** Use detailed ASCII tables for financial data.
 
## CHAIN OF THOUGHT:
Before answering, THINK:
1.  What is the anomaly here?
2.  Is this sustainable?
3.  What is the bear case?`;

        this.systemPrompt = `${globalDirectives}\n\n${systemPrompt}`;
        if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
            throw new Error(`GEMINI_API_KEY is not configured for ${this.name}`);
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        // Dynamic Model Selection based on Agent Role
        // Using gemini-2.0-flash for all agents as it is production-stable in v1beta and fast.
        this.modelName = 'gemini-2.0-flash';
    }

    async generate(userPrompt) {
        try {
            console.log(`[${this.name}] 🤖 Starting AI synthesis...`);
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                systemInstruction: this.systemPrompt
            });

            const result = await model.generateContent(userPrompt);
            const response = await result.response;
            const text = response.text();
            console.log(`[${this.name}] ✨ Synthesis complete`);

            // Attempt to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn(`[${this.name}] ⚠️ JSON Parse Error, returning raw text:`, e.message);
                    return text;
                }
            }

            // Fallback to raw text if no JSON structure is found
            return text;
        } catch (error) {
            console.error(`[${this.name}] ❌ API Error Details:`, {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                details: error.response?.data || error.details || 'No additional details'
            });
            throw error;
        }
    }
}

module.exports = BaseAgent;
