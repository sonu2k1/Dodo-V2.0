const { supabaseAdmin } = require('../config/database');

/**
 * Time Tracking Service - Business logic for time entries
 */
class TimeTrackingService {
    /**
     * Start timer for a task
     */
    async startTimer(userId, taskId, description = '') {
        // Check for any running timer for this user
        const runningTimer = await this.getRunningTimer(userId);
        if (runningTimer) {
            // Auto-stop the previous timer
            await this.stopTimer(userId, runningTimer.id);
        }

        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .insert({
                user_id: userId,
                task_id: taskId,
                description,
                start_time: new Date().toISOString(),
                is_running: true,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Stop running timer
     */
    async stopTimer(userId, entryId = null) {
        let query = supabaseAdmin
            .from('time_entries')
            .update({
                end_time: new Date().toISOString(),
                is_running: false,
            })
            .eq('user_id', userId)
            .eq('is_running', true);

        if (entryId) {
            query = query.eq('id', entryId);
        }

        const { data, error } = await query.select().single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore no rows

        // Calculate duration if entry found
        if (data) {
            const duration = Math.round(
                (new Date(data.end_time) - new Date(data.start_time)) / 1000
            );

            await supabaseAdmin
                .from('time_entries')
                .update({ duration_seconds: duration })
                .eq('id', data.id);

            return { ...data, duration_seconds: duration };
        }

        return null;
    }

    /**
     * Get running timer for user
     */
    async getRunningTimer(userId) {
        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .select(`
        *,
        task:tasks (
          id,
          title,
          project:projects (
            id,
            name
          )
        )
      `)
            .eq('user_id', userId)
            .eq('is_running', true)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    /**
     * Create manual time entry
     */
    async createManualEntry(userId, entryData) {
        const { taskId, date, hours, minutes = 0, description } = entryData;

        const durationSeconds = (hours * 60 + minutes) * 60;
        const startTime = new Date(date);
        const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .insert({
                user_id: userId,
                task_id: taskId,
                description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration_seconds: durationSeconds,
                is_running: false,
                is_manual: true,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update time entry
     */
    async updateEntry(entryId, userId, updates) {
        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', entryId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete time entry
     */
    async deleteEntry(entryId, userId) {
        const { error } = await supabaseAdmin
            .from('time_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    }

    /**
     * Get time entries for user with filters
     */
    async getEntries(userId, filters = {}) {
        let query = supabaseAdmin
            .from('time_entries')
            .select(`
        *,
        task:tasks (
          id,
          title,
          project:projects (
            id,
            name
          )
        )
      `)
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        // Date range filter
        if (filters.startDate) {
            query = query.gte('start_time', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('start_time', filters.endDate);
        }
        if (filters.taskId) {
            query = query.eq('task_id', filters.taskId);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Get daily summary for user
     */
    async getDailySummary(userId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .select(`
        *,
        task:tasks (
          id,
          title,
          project:projects (id, name)
        )
      `)
            .eq('user_id', userId)
            .eq('is_running', false)
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());

        if (error) throw error;

        // Aggregate by task
        const byTask = {};
        let totalSeconds = 0;

        data.forEach(entry => {
            const taskId = entry.task_id || 'no-task';
            if (!byTask[taskId]) {
                byTask[taskId] = {
                    task: entry.task,
                    entries: [],
                    totalSeconds: 0,
                };
            }
            byTask[taskId].entries.push(entry);
            byTask[taskId].totalSeconds += entry.duration_seconds || 0;
            totalSeconds += entry.duration_seconds || 0;
        });

        return {
            date: date,
            totalSeconds,
            totalHours: (totalSeconds / 3600).toFixed(2),
            byTask: Object.values(byTask),
            entryCount: data.length,
        };
    }

    /**
     * Get weekly summary for user
     */
    async getWeeklySummary(userId, weekStartDate) {
        const startOfWeek = new Date(weekStartDate);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .select(`
        *,
        task:tasks (
          id,
          title,
          project:projects (id, name)
        )
      `)
            .eq('user_id', userId)
            .eq('is_running', false)
            .gte('start_time', startOfWeek.toISOString())
            .lte('start_time', endOfWeek.toISOString());

        if (error) throw error;

        // Aggregate by day and project
        const byDay = {};
        const byProject = {};
        let totalSeconds = 0;

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            byDay[d.toISOString().split('T')[0]] = { totalSeconds: 0, entries: [] };
        }

        data.forEach(entry => {
            const day = entry.start_time.split('T')[0];
            const projectId = entry.task?.project?.id || 'no-project';
            const projectName = entry.task?.project?.name || 'No Project';

            if (byDay[day]) {
                byDay[day].totalSeconds += entry.duration_seconds || 0;
                byDay[day].entries.push(entry);
            }

            if (!byProject[projectId]) {
                byProject[projectId] = { name: projectName, totalSeconds: 0 };
            }
            byProject[projectId].totalSeconds += entry.duration_seconds || 0;

            totalSeconds += entry.duration_seconds || 0;
        });

        return {
            weekStart: startOfWeek.toISOString().split('T')[0],
            weekEnd: endOfWeek.toISOString().split('T')[0],
            totalSeconds,
            totalHours: (totalSeconds / 3600).toFixed(2),
            byDay: Object.entries(byDay).map(([date, data]) => ({
                date,
                ...data,
                hours: (data.totalSeconds / 3600).toFixed(2),
            })),
            byProject: Object.values(byProject).map(p => ({
                ...p,
                hours: (p.totalSeconds / 3600).toFixed(2),
            })),
            entryCount: data.length,
        };
    }

    /**
     * Get task time summary
     */
    async getTaskTimeSummary(taskId) {
        const { data, error } = await supabaseAdmin
            .from('time_entries')
            .select('duration_seconds, user_id')
            .eq('task_id', taskId)
            .eq('is_running', false);

        if (error) throw error;

        const totalSeconds = data.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
        const byUser = {};

        data.forEach(entry => {
            if (!byUser[entry.user_id]) byUser[entry.user_id] = 0;
            byUser[entry.user_id] += entry.duration_seconds || 0;
        });

        return {
            taskId,
            totalSeconds,
            totalHours: (totalSeconds / 3600).toFixed(2),
            entryCount: data.length,
            byUser,
        };
    }
}

module.exports = new TimeTrackingService();
