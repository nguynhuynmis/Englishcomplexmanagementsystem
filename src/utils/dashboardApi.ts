import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e2861589`;

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  todaySchedules: number;
  totalEnrollments: number;
  totalCenters: number;
  recentEnrollments: Array<{
    id: string;
    student_name: string;
    class_name: string;
    joined_date: string;
  }>;
  enrollmentsByMonth: Array<{
    month: string;
    count: number;
  }>;
  classesByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface ReportStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  students: any[];
  teachers: any[];
  classes: any[];
  campuses: any[];
  enrollmentTrend?: Array<{ month: string; students: number }>;
  studentsByCampus?: Array<{ name: string; students: number }>;
  gradeDistribution?: Array<{ name: string; value: number; color: string }>;
  teacherPerformance?: Array<{ name: string; rating: number; classes: number; students: number }>;
  recentFeedback?: Array<{ student: string; rating: number; comment: string; date: string }>;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [Dashboard] Fetching stats...');
    
    // Fetch students
    const studentsRes = await fetch(`${API_BASE}/students`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
    const students = studentsData.students || studentsData || [];
    console.log('📊 [Dashboard] Students response:', studentsData);
    console.log('📊 [Dashboard] Students parsed:', students.length, students);

    // Fetch teachers
    const teachersRes = await fetch(`${API_BASE}/teachers`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const teachersData = teachersRes.ok ? await teachersRes.json() : { teachers: [] };
    const teachers = teachersData.teachers || teachersData || [];
    console.log('📊 [Dashboard] Teachers response:', teachersData);
    console.log('📊 [Dashboard] Teachers parsed:', teachers.length, teachers);

    // Fetch classes
    const classesRes = await fetch(`${API_BASE}/classes`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const classesData = classesRes.ok ? await classesRes.json() : [];
    const classes = Array.isArray(classesData) ? classesData : (classesData.classes || []);
    console.log('📊 [Dashboard] Classes response:', classesData);
    console.log('📊 [Dashboard] Classes parsed:', classes.length, classes);

    // Fetch enrollments
    const enrollmentsRes = await fetch(`${API_BASE}/enrollments`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : { enrollments: [] };
    const enrollments = enrollmentsData.enrollments || enrollmentsData || [];
    console.log('📊 [Dashboard] Enrollments response:', enrollmentsData);
    console.log('📊 [Dashboard] Enrollments parsed:', enrollments.length, enrollments);

    // Fetch centers
    const centersRes = await fetch(`${API_BASE}/centers`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const centersData = centersRes.ok ? await centersRes.json() : { centers: [] };
    const centers = centersData.centers || centersData || [];
    console.log('📊 [Dashboard] Centers response:', centersData);
    console.log('📊 [Dashboard] Centers parsed:', centers.length, centers);

    const stats = {
      totalStudents: students.length || 0,
      totalTeachers: teachers.length || 0,
      totalClasses: classes.length || 0,
      activeClasses: classes.filter((c: any) => c.status === 'active').length || 0,
      todaySchedules: 0, // Will implement later
      totalEnrollments: enrollments.length || 0,
      totalCenters: centers.length || 0,
      recentEnrollments: enrollments.slice(-5).reverse().map((e: any) => ({
        id: e.id,
        student_name: e.student_name,
        class_name: e.class_name,
        joined_date: e.joined_date
      })),
      enrollmentsByMonth: [],
      classesByStatus: [
        { status: 'Active', count: classes.filter((c: any) => c.status === 'active').length || 0 },
        { status: 'Inactive', count: classes.filter((c: any) => c.status === 'inactive').length || 0 },
        { status: 'Completed', count: classes.filter((c: any) => c.status === 'completed').length || 0 }
      ].filter(s => s.count > 0)
    };
    
    console.log('📊 [Dashboard] Final stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      activeClasses: 0,
      todaySchedules: 0,
      totalEnrollments: 0,
      totalCenters: 0,
      recentEnrollments: [],
      enrollmentsByMonth: [],
      classesByStatus: []
    };
  }
};

export const fetchReportStats = async (): Promise<ReportStats> => {
  try {
    console.log('📊 [ReportStats] Fetching data from API...');
    
    // Fetch students
    const studentsRes = await fetch(`${API_BASE}/students`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
    const students = studentsData.students || studentsData || [];
    console.log('✅ [ReportStats] Students loaded:', students.length);

    // Fetch teachers
    const teachersRes = await fetch(`${API_BASE}/teachers`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const teachersData = teachersRes.ok ? await teachersRes.json() : { teachers: [] };
    const teachers = teachersData.teachers || teachersData || [];
    console.log('✅ [ReportStats] Teachers loaded:', teachers.length);

    // Fetch classes
    const classesRes = await fetch(`${API_BASE}/classes`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const classes = classesRes.ok ? await classesRes.json() : [];
    console.log('✅ [ReportStats] Classes loaded:', classes.length);

    // Fetch campuses
    const campusesRes = await fetch(`${API_BASE}/campuses`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const campuses = campusesRes.ok ? await campusesRes.json() : [];
    console.log('✅ [ReportStats] Campuses loaded:', campuses.length);

    return {
      totalStudents: students.length || 0,
      totalTeachers: teachers.length || 0,
      totalClasses: classes.length || 0,
      activeClasses: classes.filter((c: any) => c.status === 'active').length || 0,
      students,
      teachers,
      classes,
      campuses
    };
  } catch (error) {
    console.error('❌ [ReportStats] Error:', error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      activeClasses: 0,
      students: [],
      teachers: [],
      classes: [],
      campuses: []
    };
  }
};

export const fetchTeacherClasses = async (teacherName: string) => {
  try {
    const classesRes = await fetch(`${API_BASE}/classes`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const classes = classesRes.ok ? await classesRes.json() : [];
    
    return classes.filter((c: any) => c.teacher === teacherName && c.status === 'active');
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
  }
};