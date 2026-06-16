import { StudentReport } from '../types/Report';
import { supabase } from '../lib/supabase';

const API_URL = 'http://localhost:8000/api';

export const reportsService = {
  async generateReport(studentId: string): Promise<StudentReport> {
    const res = await fetch(`${API_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to generate report');
    }

    const data = await res.json();
    return data.report;
  },

  async getHistoricalReports(studentId: string): Promise<StudentReport[]> {
    const res = await fetch(`${API_URL}/reports/${studentId}`);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to fetch historical reports');
    }

    const data = await res.json();
    return data.reports;
  }
};
