const { google } = require('googleapis');
const config = require('../config/env');

/**
 * Google Calendar Service for task deadline syncing
 */
class CalendarService {
    constructor() {
        this.calendar = null;
        this.initialized = false;
    }

    /**
     * Initialize Calendar API with service account or OAuth
     */
    async initialize(accessToken = null) {
        try {
            let auth;

            if (accessToken) {
                // OAuth2 for user-specific calendars
                auth = new google.auth.OAuth2();
                auth.setCredentials({ access_token: accessToken });
            } else {
                // Service account for system operations
                auth = new google.auth.GoogleAuth({
                    credentials: config.google?.serviceAccountKey ?
                        JSON.parse(config.google.serviceAccountKey) : undefined,
                    keyFile: config.google?.serviceAccountKeyPath,
                    scopes: ['https://www.googleapis.com/auth/calendar'],
                });
            }

            this.calendar = google.calendar({ version: 'v3', auth });
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Calendar:', error.message);
            return false;
        }
    }

    /**
     * Create calendar event for task deadline
     */
    async createTaskEvent(task, calendarId = 'primary') {
        if (!this.initialized) {
            throw new Error('Calendar not initialized');
        }

        const event = {
            summary: `📋 ${task.title}`,
            description: [
                task.description || '',
                '',
                `Project: ${task.project_name || 'N/A'}`,
                `Priority: ${task.priority || 'normal'}`,
                `DoDo Task ID: ${task.id}`,
            ].join('\n'),
            start: {
                dateTime: new Date(task.due_date).toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 60 },
                    { method: 'email', minutes: 1440 }, // 24 hours
                ],
            },
            colorId: this.getPriorityColor(task.priority),
        };

        const response = await this.calendar.events.insert({
            calendarId,
            resource: event,
        });

        return {
            eventId: response.data.id,
            htmlLink: response.data.htmlLink,
        };
    }

    /**
     * Update calendar event
     */
    async updateTaskEvent(eventId, task, calendarId = 'primary') {
        if (!this.initialized) {
            throw new Error('Calendar not initialized');
        }

        const event = {
            summary: `📋 ${task.title}`,
            description: task.description || '',
            start: {
                dateTime: new Date(task.due_date).toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Kolkata',
            },
        };

        await this.calendar.events.update({
            calendarId,
            eventId,
            resource: event,
        });

        return { success: true };
    }

    /**
     * Delete calendar event
     */
    async deleteTaskEvent(eventId, calendarId = 'primary') {
        if (!this.initialized) {
            throw new Error('Calendar not initialized');
        }

        await this.calendar.events.delete({
            calendarId,
            eventId,
        });

        return { success: true };
    }

    /**
     * Get upcoming events
     */
    async getUpcomingEvents(calendarId = 'primary', maxResults = 10) {
        if (!this.initialized) {
            throw new Error('Calendar not initialized');
        }

        const response = await this.calendar.events.list({
            calendarId,
            timeMin: new Date().toISOString(),
            maxResults,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    }

    /**
     * Map priority to Google Calendar color ID
     */
    getPriorityColor(priority) {
        const colors = {
            urgent: '11', // Red
            high: '6',    // Orange
            medium: '5',  // Yellow
            low: '2',     // Green
            normal: '1',  // Blue
        };
        return colors[priority] || colors.normal;
    }

    /**
     * Sync multiple tasks to calendar
     */
    async syncTasks(tasks, calendarId = 'primary') {
        const results = [];

        for (const task of tasks) {
            if (!task.due_date) continue;

            try {
                if (task.calendar_event_id) {
                    await this.updateTaskEvent(task.calendar_event_id, task, calendarId);
                    results.push({ taskId: task.id, action: 'updated', success: true });
                } else {
                    const event = await this.createTaskEvent(task, calendarId);
                    results.push({ taskId: task.id, action: 'created', eventId: event.eventId, success: true });
                }
            } catch (error) {
                results.push({ taskId: task.id, success: false, error: error.message });
            }
        }

        return results;
    }
}

module.exports = new CalendarService();
