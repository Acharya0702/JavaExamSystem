// online-exam-frontend/src/api/exam.ts
import axios from '../config/axios';

export const examAPI = {
    // Teacher endpoints
    getTeacherExams: async (): Promise<any[]> => {
        const response = await axios.get('/teacher/exams');
        return response.data;
    },

    getTeacherExamById: async (examId: number): Promise<any> => {
        const response = await axios.get(`/teacher/exams/${examId}`);
        return response.data;
    },

    createExam: async (examData: any): Promise<any> => {
        const response = await axios.post('/teacher/exams', examData);
        return response.data;
    },

    updateExam: async (examId: number, examData: any): Promise<any> => {
        const response = await axios.put(`/teacher/exams/${examId}`, examData);
        return response.data;
    },

    deleteExam: async (examId: number): Promise<void> => {
        await axios.delete(`/teacher/exams/${examId}`);
    },

    getExamResults: async (examId: number): Promise<any[]> => {
        const response = await axios.get(`/teacher/exams/${examId}/results`);
        return response.data;
    },

    getDashboardStats: async (): Promise<any> => {
        const response = await axios.get('/teacher/dashboard');
        return response.data;
    },

    getStudentDashboard: async (): Promise<any> => {
        try {
            console.log('📡 Calling /student/dashboard endpoint...');
            const response = await axios.get('/student/dashboard');
            console.log('✅ Student dashboard raw response:', response);
            console.log('✅ Response data:', response.data);
            return response.data; // Make sure you're returning response.data, not response
        } catch (error: any) {
            console.error('❌ Error fetching student dashboard:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    },

    getAvailableExams: async (): Promise<any[]> => {
        try {
            console.log('📡 Calling /student/exams/available endpoint...');
            const response = await axios.get('/student/exams/available');
            console.log('✅ Available exams response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error fetching available exams:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    },

    getStudentExamById: async (examId: number): Promise<any> => {
        const response = await axios.get(`/student/exams/${examId}`);
        return response.data;
    },

    // FIXED: Remove examId from request body since it's in the URL
    submitExam: async (data: any): Promise<any> => {
        try {
            console.log('📤 [examAPI] Submitting exam:', data.examId);
            console.log('📤 [examAPI] Answers count:', data.answers?.length);
            console.log('📤 [examAPI] Time taken:', data.timeTaken);

            // Create request body WITHOUT examId (it's in the URL)
            const requestBody = {
                answers: data.answers,
                timeTaken: data.timeTaken || 0
            };

            console.log('📤 [examAPI] Request body:', requestBody);

            const response = await axios.post(`/student/exams/${data.examId}/submit`, requestBody);

            console.log('✅ [examAPI] Submission successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ [examAPI] Error submitting exam:', error);
            console.error('❌ [examAPI] Error response:', error.response?.data);
            console.error('❌ [examAPI] Error status:', error.response?.status);
            throw error;
        }
    },

    getStudentResults: async (): Promise<any[]> => {
        const response = await axios.get('/student/exams/results');
        return response.data;
    },

    getResultById: async (resultId: number): Promise<any> => {
        const response = await axios.get(`/student/exams/results/${resultId}`);
        return response.data;
    },
};

export default axios;


