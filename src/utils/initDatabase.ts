// Initialize database with mock data
// This should be called once when the app first loads

import { adminAPI } from './api';
import { 
  students, 
  teachers, 
  campuses, 
  classes, 
  notifications,
  academicStaff,
  directors
} from '../data/mockData';
import { updatedSchedules } from '../data/schedules';

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database with default data...');

    // Prepare users array from all user types
    const users = [
      // Academic staff
      ...academicStaff.map(staff => ({
        id: staff.id,
        username: staff.username,
        password: '123456', // Default password
        fullName: staff.fullName,
        role: 'academic' as const,
        email: staff.email,
        phone: staff.phone,
        avatar: staff.avatar,
        code: staff.code,
      })),
      // Directors
      ...directors.map(director => ({
        id: director.id,
        username: director.username,
        password: '123456', // Default password
        fullName: director.fullName,
        role: 'director' as const,
        email: director.email,
        phone: director.phone,
        avatar: director.avatar,
      })),
      // Teachers
      ...teachers.map(teacher => ({
        id: teacher.id,
        username: teacher.username,
        password: '123456', // Default password
        fullName: teacher.fullName,
        role: 'teacher' as const,
        email: teacher.email,
        phone: teacher.phone,
        avatar: teacher.avatar,
        code: teacher.code,
      })),
      // Students
      ...students.map(student => ({
        id: student.id,
        username: student.username,
        password: '123456', // Default password
        fullName: student.fullName,
        role: 'student' as const,
        email: student.email,
        phone: student.phone,
        avatar: student.avatar,
        code: student.code,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
      })),
    ];

    const initData = {
      users,
      students,
      teachers,
      campuses,
      classes,
      schedules: updatedSchedules,
      notifications,
      grades: [], // Empty initially
      documents: [], // Empty initially
      assignments: [], // Empty initially
      feedback: [], // Empty initially
    };

    await adminAPI.initializeData(initData);

    console.log('✅ Database initialized successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Campuses: ${campuses.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Schedules: ${updatedSchedules.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('   Academic: huongvtt / 123456');
    console.log('   Director: duccv / 123456');
    console.log('   Teacher: lanntm / 123456');
    console.log('   Student: huyenntk / 123456');

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Check if database needs initialization
export async function checkDatabaseInitialization() {
  const DB_INIT_KEY = 'english_complex_db_initialized';
  const isInitialized = localStorage.getItem(DB_INIT_KEY);

  if (!isInitialized) {
    console.log('Database not initialized. Running initialization...');
    await initializeDatabase();
    localStorage.setItem(DB_INIT_KEY, 'true');
  } else {
    console.log('Database already initialized.');
  }
}
