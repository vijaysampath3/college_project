export const studentData = {
  profile: {
    id: 'STU001',
    name: 'Alex Johnson',
    grade: '8th Grade',
    school: 'Westfield Middle School',
    avatarUrl: 'https://images.pexels.com/photo/220453/photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  scores: {
    readingRisk: 32,
    attentionScore: 78,
    learningBehaviour: 85,
    overallProgress: 72,
  },
  assessmentHistory: [
    { date: 'Jan', reading: 65, attention: 70, behaviour: 75 },
    { date: 'Feb', reading: 68, attention: 72, behaviour: 78 },
    { date: 'Mar', reading: 70, attention: 75, behaviour: 80 },
    { date: 'Apr', reading: 72, attention: 76, behaviour: 82 },
    { date: 'May', reading: 75, attention: 78, behaviour: 85 },
  ],
  weeklyProgress: [
    { day: 'Mon', minutes: 45, assessments: 2 },
    { day: 'Tue', minutes: 60, assessments: 3 },
    { day: 'Wed', minutes: 30, assessments: 1 },
    { day: 'Thu', minutes: 75, assessments: 2 },
    { day: 'Fri', minutes: 50, assessments: 2 },
  ],
  recentActivity: [
    {
      id: 1,
      type: 'assessment',
      title: 'Reading Comprehension Test',
      date: '2024-01-15',
      score: 78,
      status: 'completed',
    },
    {
      id: 2,
      type: 'assessment',
      title: 'Visual Attention Task',
      date: '2024-01-14',
      score: 85,
      status: 'completed',
    },
    {
      id: 3,
      type: 'recommendation',
      title: 'Try chunking method for reading',
      date: '2024-01-13',
      status: 'new',
    },
  ],
  recommendations: [
    {
      id: 1,
      title: 'Practice Phonemic Awareness',
      description: 'Daily 15-minute exercises focusing on sound-letter relationships.',
      priority: 'high',
      category: 'reading',
    },
    {
      id: 2,
      title: 'Focus Timer Sessions',
      description: 'Use the Pomodoro technique to improve concentration.',
      priority: 'medium',
      category: 'attention',
    },
    {
      id: 3,
      title: 'Multisensory Learning',
      description: 'Incorporate visual and kinesthetic elements in study sessions.',
      priority: 'medium',
      category: 'general',
    },
  ],
};

export const teacherData = {
  profile: {
    id: 'TCH001',
    name: 'Sarah Mitchell',
    school: 'Westfield Middle School',
    subjects: ['Mathematics', 'Science'],
  },
  stats: {
    totalStudents: 127,
    highRiskStudents: 8,
    assessmentsCompleted: 45,
    pendingReviews: 12,
  },
  students: [
    { id: 1, name: 'Alex Johnson', grade: '8th', riskLevel: 'low', lastAssessment: '2024-01-15', progress: 78 },
    { id: 2, name: 'Emma Davis', grade: '8th', riskLevel: 'medium', lastAssessment: '2024-01-14', progress: 65 },
    { id: 3, name: 'James Wilson', grade: '8th', riskLevel: 'high', lastAssessment: '2024-01-13', progress: 42 },
    { id: 4, name: 'Olivia Brown', grade: '8th', riskLevel: 'low', lastAssessment: '2024-01-12', progress: 88 },
    { id: 5, name: 'Michael Lee', grade: '8th', riskLevel: 'medium', lastAssessment: '2024-01-11', progress: 58 },
    { id: 6, name: 'Sophia Martinez', grade: '8th', riskLevel: 'low', lastAssessment: '2024-01-10', progress: 82 },
    { id: 7, name: 'William Taylor', grade: '8th', riskLevel: 'high', lastAssessment: '2024-01-09', progress: 35 },
    { id: 8, name: 'Ava Anderson', grade: '8th', riskLevel: 'low', lastAssessment: '2024-01-08', progress: 91 },
  ],
  riskDistribution: [
    { name: 'Low Risk', value: 72, color: '#10B981' },
    { name: 'Medium Risk', value: 19, color: '#F59E0B' },
    { name: 'High Risk', value: 9, color: '#EF4444' },
  ],
  classPerformance: [
    { subject: 'Reading', average: 76, improvement: 8 },
    { subject: 'Math', average: 82, improvement: 12 },
    { subject: 'Science', average: 71, improvement: 5 },
    { subject: 'Writing', average: 68, improvement: 15 },
  ],
  recentAssessments: [
    { id: 1, student: 'Alex Johnson', type: 'Reading', score: 78, date: '2024-01-15', status: 'reviewed' },
    { id: 2, student: 'Emma Davis', type: 'Attention', score: 65, date: '2024-01-14', status: 'pending' },
    { id: 3, student: 'James Wilson', type: 'Reading', score: 42, date: '2024-01-13', status: 'pending' },
    { id: 4, student: 'Olivia Brown', type: 'Comprehensive', score: 88, date: '2024-01-12', status: 'reviewed' },
  ],
  alerts: [
    { id: 1, type: 'warning', message: '3 students showing declining attention scores', date: '2024-01-15' },
    { id: 2, type: 'danger', message: 'James Wilson requires immediate intervention', date: '2024-01-14' },
    { id: 3, type: 'success', message: 'Class reading scores improved by 8%', date: '2024-01-13' },
  ],
};

export const parentData = {
  profile: {
    id: 'PAR001',
    name: 'Jennifer Johnson',
    email: 'jennifer.johnson@email.com',
    children: ['Alex Johnson'],
  },
  children: [
    {
      id: 'STU001',
      name: 'Alex Johnson',
      grade: '8th Grade',
      school: 'Westfield Middle School',
      scores: {
        readingProgress: 75,
        attentionScore: 78,
        learningScore: 85,
      },
      recentAssessments: [
        { title: 'Reading Comprehension', score: 78, date: '2024-01-15', trend: 'up' },
        { title: 'Visual Attention', score: 85, date: '2024-01-14', trend: 'up' },
        { title: 'Memory Recall', score: 72, date: '2024-01-10', trend: 'stable' },
      ],
      progressHistory: [
        { month: 'Sep', reading: 60, attention: 65, behaviour: 70 },
        { month: 'Oct', reading: 65, attention: 68, behaviour: 73 },
        { month: 'Nov', reading: 68, attention: 72, behaviour: 78 },
        { month: 'Dec', reading: 72, attention: 75, behaviour: 82 },
        { month: 'Jan', reading: 75, attention: 78, behaviour: 85 },
      ],
    },
  ],
  homeRecommendations: [
    {
      id: 1,
      title: 'Create a Reading Routine',
      description: 'Set aside 20 minutes daily for shared reading activities.',
      category: 'reading',
      difficulty: 'easy',
    },
    {
      id: 2,
      title: 'Practice Mindfulness Together',
      description: 'Short breathing exercises can help improve focus.',
      category: 'attention',
      difficulty: 'easy',
    },
    {
      id: 3,
      title: 'Learning Games Night',
      description: 'Weekly board games that build cognitive skills.',
      category: 'general',
      difficulty: 'medium',
    },
  ],
};

export const adminData = {
  stats: {
    totalStudents: 2847,
    totalTeachers: 127,
    totalParents: 2156,
    totalSchools: 15,
    assessmentsCompleted: 12458,
    activeUsers: 1842,
  },
  platformUsage: [
    { month: 'Sep', users: 1200, assessments: 1800 },
    { month: 'Oct', users: 1450, assessments: 2100 },
    { month: 'Nov', users: 1680, assessments: 2400 },
    { month: 'Dec', users: 1750, assessments: 2500 },
    { month: 'Jan', users: 1842, assessments: 2658 },
  ],
  systemAnalytics: [
    { name: 'Students', value: 2847 },
    { name: 'Teachers', value: 127 },
    { name: 'Parents', value: 2156 },
    { name: 'Schools', value: 15 },
  ],
  riskDistribution: [
    { name: 'Low Risk', value: 68, color: '#10B981' },
    { name: 'Medium Risk', value: 23, color: '#F59E0B' },
    { name: 'High Risk', value: 9, color: '#EF4444' },
  ],
  recentUsers: [
    { id: 1, name: 'Emily Chen', role: 'Student', school: 'Lincoln High', joined: '2024-01-15' },
    { id: 2, name: 'Robert Miller', role: 'Teacher', school: 'Westfield Middle', joined: '2024-01-14' },
    { id: 3, name: 'Maria Garcia', role: 'Parent', school: 'Lincoln High', joined: '2024-01-13' },
    { id: 4, name: 'David Kim', role: 'Teacher', school: 'Oak Ridge Elementary', joined: '2024-01-12' },
    { id: 5, name: 'Sarah Thompson', role: 'Student', school: 'Riverside Academy', joined: '2024-01-11' },
  ],
  schools: [
    { id: 1, name: 'Westfield Middle School', students: 342, teachers: 18, district: 'Westfield District' },
    { id: 2, name: 'Lincoln High School', students: 856, teachers: 42, district: 'Lincoln District' },
    { id: 3, name: 'Oak Ridge Elementary', students: 289, teachers: 15, district: 'Oak Ridge District' },
    { id: 4, name: 'Riverside Academy', students: 512, teachers: 28, district: 'Riverside District' },
    { id: 5, name: 'Summit Preparatory', students: 196, teachers: 12, district: 'Summit District' },
  ],
};
