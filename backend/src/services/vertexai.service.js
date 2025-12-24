const { VertexAI } = require('@google-cloud/vertexai');
const config = require('../config/env');
const { supabaseAdmin } = require('../config/database');

/**
 * Vertex AI Service - Gemini Pro integration for summarization and suggestions
 * 
 * Features:
 * - Chat thread summarization
 * - Task sub-task suggestions
 * - Email thread summaries
 * - Human-in-the-loop approval workflow
 */
class VertexAIService {
    constructor() {
        this.vertexai = null;
        this.model = null;
        this.initialized = false;

        // Cost tracking
        this.tokenUsage = { input: 0, output: 0 };
    }

    /**
     * Initialize Vertex AI
     */
    async initialize() {
        if (this.initialized) return;

        try {
            this.vertexai = new VertexAI({
                project: config.google?.projectId || process.env.GOOGLE_PROJECT_ID,
                location: config.google?.location || 'us-central1',
            });

            this.model = this.vertexai.getGenerativeModel({
                model: 'gemini-1.5-pro',
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.4, // Lower for more focused responses
                    topP: 0.8,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ],
            });

            this.initialized = true;
            console.log('Vertex AI initialized');
        } catch (error) {
            console.error('Vertex AI init failed:', error.message);
        }
    }

    /**
     * Generate content with cost tracking
     */
    async generate(prompt, systemInstruction = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        if (systemInstruction) {
            request.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const result = await this.model.generateContent(request);
        const response = await result.response;

        // Track token usage for cost monitoring
        if (response.usageMetadata) {
            this.tokenUsage.input += response.usageMetadata.promptTokenCount || 0;
            this.tokenUsage.output += response.usageMetadata.candidatesTokenCount || 0;
        }

        return response.candidates[0]?.content?.parts[0]?.text || '';
    }

    /**
     * Summarize chat thread
     */
    async summarizeChatThread(messages, options = {}) {
        const systemPrompt = `You are a concise business communication summarizer. 
Create brief, actionable summaries. Focus on:
- Key decisions made
- Action items with owners
- Important dates/deadlines
- Unresolved questions

Be extremely concise. Use bullet points. Max 150 words.`;

        // Truncate messages for cost efficiency
        const recentMessages = messages.slice(-30); // Last 30 messages
        const chatContent = recentMessages
            .map(m => `[${m.sender_name}]: ${m.content}`)
            .join('\n');

        const prompt = `Summarize this team chat thread:\n\n${chatContent}`;

        const summary = await this.generate(prompt, systemPrompt);

        return {
            summary,
            messageCount: messages.length,
            summarizedCount: recentMessages.length,
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Generate sub-task suggestions for a task
     */
    async suggestSubtasks(task) {
        const systemPrompt = `You are a project management expert.
Generate 3-5 actionable sub-tasks for the given task.
Each sub-task should be:
- Specific and measurable
- Completable in 1-4 hours
- Clear in scope

Return as JSON array: [{"title": "...", "estimate_hours": N, "priority": "high|medium|low"}]
Only return valid JSON, nothing else.`;

        const prompt = `Task: ${task.title}
Description: ${task.description || 'No description'}
Project: ${task.project_name || 'General'}
Priority: ${task.priority || 'medium'}

Generate sub-tasks:`;

        const response = await this.generate(prompt, systemPrompt);

        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const subtasks = JSON.parse(jsonMatch[0]);
                return {
                    suggestions: subtasks,
                    taskId: task.id,
                    generatedAt: new Date().toISOString(),
                    status: 'pending_approval',
                };
            }
        } catch (e) {
            console.error('Failed to parse subtasks:', e);
        }

        return { suggestions: [], error: 'Failed to generate suggestions' };
    }

    /**
     * Summarize email thread
     */
    async summarizeEmailThread(emails) {
        const systemPrompt = `You are an executive assistant summarizing email threads.
Provide:
1. **Summary** (2-3 sentences)
2. **Key Points** (3-5 bullets)
3. **Action Items** (if any)
4. **Sentiment** (Positive/Neutral/Negative)
5. **Recommended Response** (1 sentence suggestion)

Be concise and professional. Max 200 words.`;

        // Process emails efficiently
        const emailContent = emails
            .slice(-10) // Last 10 emails
            .map(e => `From: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\n${e.snippet || e.body?.substring(0, 300)}`)
            .join('\n---\n');

        const prompt = `Summarize this email thread:\n\n${emailContent}`;

        const summary = await this.generate(prompt, systemPrompt);

        return {
            summary,
            emailCount: emails.length,
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Save AI suggestion for human approval
     */
    async saveSuggestion(type, entityId, suggestion, userId) {
        const { data, error } = await supabaseAdmin
            .from('ai_suggestions')
            .insert({
                type, // 'subtasks', 'summary', 'email_summary'
                entity_id: entityId,
                entity_type: type === 'subtasks' ? 'task' : type === 'summary' ? 'chat_room' : 'email_thread',
                suggestion_data: suggestion,
                status: 'pending',
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Approve AI suggestion
     */
    async approveSuggestion(suggestionId, userId, selectedItems = null) {
        const { data, error } = await supabaseAdmin
            .from('ai_suggestions')
            .update({
                status: 'approved',
                approved_by: userId,
                approved_at: new Date().toISOString(),
                selected_items: selectedItems, // For partial approval
            })
            .eq('id', suggestionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Reject AI suggestion
     */
    async rejectSuggestion(suggestionId, userId, reason = null) {
        const { data, error } = await supabaseAdmin
            .from('ai_suggestions')
            .update({
                status: 'rejected',
                rejected_by: userId,
                rejected_at: new Date().toISOString(),
                rejection_reason: reason,
            })
            .eq('id', suggestionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get pending suggestions for user
     */
    async getPendingSuggestions(userId) {
        const { data, error } = await supabaseAdmin
            .from('ai_suggestions')
            .select('*')
            .eq('created_by', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Apply approved subtasks to a task
     */
    async applySubtasks(taskId, subtasks, userId) {
        const subtaskRecords = subtasks.map((st, idx) => ({
            title: st.title,
            parent_task_id: taskId,
            estimated_hours: st.estimate_hours,
            priority: st.priority,
            status: 'todo',
            created_by: userId,
            order_index: idx,
        }));

        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert(subtaskRecords)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Get token usage stats (for cost monitoring)
     */
    getTokenUsage() {
        // Approximate costs (as of 2024)
        const inputCost = (this.tokenUsage.input / 1000) * 0.00025;
        const outputCost = (this.tokenUsage.output / 1000) * 0.0005;

        return {
            ...this.tokenUsage,
            totalTokens: this.tokenUsage.input + this.tokenUsage.output,
            estimatedCostUSD: (inputCost + outputCost).toFixed(4),
        };
    }
}

module.exports = new VertexAIService();
