const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

/**
 * Gemini AI Service for smart summaries and insights
 */
class GeminiService {
    constructor() {
        this.genAI = null;
        this.model = null;

        if (config.gemini?.apiKey) {
            this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    }

    /**
     * Check if Gemini is configured
     */
    isConfigured() {
        return !!this.model;
    }

    /**
     * Generate a smart summary of email threads
     */
    async summarizeEmailThread(emails) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API not configured');
        }

        const emailContent = emails.map((email, idx) =>
            `Email ${idx + 1}:\nFrom: ${email.from}\nDate: ${email.date}\nSubject: ${email.subject}\n\n${email.body}`
        ).join('\n\n---\n\n');

        const prompt = `You are an expert business analyst. Analyze the following email thread and provide:

1. **Summary**: A concise 2-3 sentence summary of the entire conversation
2. **Key Points**: Bullet points of the most important information
3. **Action Items**: Any tasks or follow-ups mentioned
4. **Sentiment**: Overall sentiment (Positive/Neutral/Negative)
5. **Next Steps**: Recommended next steps for the sales team

Email Thread:
${emailContent}

Provide your analysis in a structured format.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                summary: response.text(),
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate summary');
        }
    }

    /**
     * Generate lead insights and recommendations
     */
    async generateLeadInsights(lead) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API not configured');
        }

        const prompt = `You are a sales expert. Analyze this lead and provide actionable insights:

Lead Information:
- Company: ${lead.company_name}
- Contact: ${lead.contact_name}
- Email: ${lead.email}
- Source: ${lead.source}
- Status: ${lead.status}
- Estimated Value: ${lead.estimated_value}
- Notes: ${lead.notes || 'None'}

Provide:
1. **Lead Score** (1-100): Likelihood to convert
2. **Strengths**: Positive indicators
3. **Concerns**: Potential risks
4. **Recommendations**: Specific actions to increase conversion
5. **Suggested Timeline**: Best approach timing

Keep response concise and actionable.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                insights: response.text(),
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate insights');
        }
    }

    /**
     * Suggest follow-up message
     */
    async suggestFollowUp(lead, context) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API not configured');
        }

        const prompt = `Write a professional follow-up email for this sales lead:

Lead: ${lead.company_name} (${lead.contact_name})
Current Status: ${lead.status}
Last Contact: ${context.lastContactDate || 'Unknown'}
Context: ${context.notes || 'Initial follow-up'}

Write a brief, personalized email (max 150 words) that:
- Acknowledges previous interactions
- Provides value
- Has a clear call-to-action
- Sounds natural, not salesy

Return only the email body.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                suggestion: response.text(),
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate follow-up');
        }
    }
}

module.exports = new GeminiService();
