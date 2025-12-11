// Mock data for English Complex system

import { updatedSchedules } from './schedules';

export interface Campus {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  school: string; // Thêm trường học
  parentName: string;
  parentPhone: string;
  campus: string;
  currentClass?: string; // Lớp đang theo học
  enrollDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Teacher {
  id: string;
  code: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  campus: string;
  bio: string;
  ieltsScore?: number;
  ieltsProof?: { fileName: string; uploadedAt: string }; // Minh chứng IELTS
  toeicScore?: number;
  toeicProof?: { fileName: string; uploadedAt: string }; // Minh chứng TOEIC
  toeflScore?: number;
  toeflProof?: { fileName: string; uploadedAt: string }; // Minh chứng TOEFL
  certificates: string[];
  certificateProofs?: { [key: string]: { fileName: string; uploadedAt: string } }; // Minh chứng chứng chỉ khác
  specialization: string[];
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface AcademicStaff {
  id: string;
  code: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Director {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  position: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'exam' | 'holiday' | 'event' | 'regulation' | 'general';
  date: string;
  author: string;
  isRead: boolean;
  targetRole?: string[];
}

export interface Class {
  id: string;
  code: string;
  name: string;
  level: string;
  campus: string;
  room: string;
  schedule: string;
  teacher: string;
  startDate: string;
  endDate: string;
  totalStudents: number;
  maxStudents: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface Schedule {
  id: string;
  classId: string;
  className: string;
  date: string; // Ngày cụ thể: YYYY-MM-DD
  dayOfWeek: string; // Thứ 2, Thứ 3, etc.
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  teacherId: string;
  campus: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  studentIds: string[]; // Danh sách ID học viên
  attendanceRecords?: {
    studentId: string;
    status: 'present' | 'absent' | 'late';
    note?: string;
  }[];
}

// Campus Data
export const campuses: Campus[] = [
  {
    id: 'CS001',
    code: 'CS001',
    name: 'Cơ sở Long Biên',
    address: '63/109 Nguyễn Sơn, phường Bồ Đề, Long Biên, Hà Nội',
    phone: '024 3872 5678',
    email: 'longbien@englishcomplex.edu.vn',
    status: 'active',
  },
  {
    id: 'CS002',
    code: 'CS002',
    name: 'Cơ sở Hai Bà Trưng',
    address: '234 Ngõ Quỳnh, phường Bạch Mai, Hai Bà Trưng, Hà Nội',
    phone: '024 3974 6789',
    email: 'haibatrung@englishcomplex.edu.vn',
    status: 'active',
  },
];

// Danh sách tên cơ sở để dùng trong filter
export const campusNames = campuses.map(c => c.name);

// Students Data
export const students: Student[] = [
  {
    id: 'HV001',
    code: 'HV001',
    fullName: 'Nguyên Thị Khánh Huyền', // NGUYÊN không phải Nguyễn
    username: 'huyenntk',
    email: 'huyenntk@gmail.com',
    phone: '0343210604',
    dateOfBirth: '2004-06-21',
    gender: 'female',
    address: '58 Ngõ Mai Hương, Bạch Mai, Hà Nội',
    school: 'Đại học Kinh tế Quốc dân',
    parentName: 'Nguyễn Đình Quang Minh',
    parentPhone: '0388033504',
    campus: 'CS002', // Cơ sở Hai Bà Trưng
    currentClass: 'LH002',
    enrollDate: '2024-01-15',
    status: 'active',
    avatar: 'huyenntk.jpg',
  },
  {
    id: 'HV002',
    code: 'HV002',
    fullName: 'Trần Minh Anh',
    username: 'anhtm',
    email: 'tranminhanh2005@gmail.com',
    phone: '0923456789',
    dateOfBirth: '2005-07-22',
    gender: 'male',
    address: '456 Giải Phóng, Hai Bà Trưng, Hà Nội',
    school: 'Đại học Ngoại thương',
    parentName: 'Trần Thị Lan',
    parentPhone: '0976543210',
    campus: 'CS002',
    currentClass: 'LH004',
    enrollDate: '2024-02-01',
    status: 'active',
    avatar: 'anhtm.jpg',
  },
  {
    id: 'HV003',
    code: 'HV003',
    fullName: 'Lê Hoàng Nam',
    username: 'namlh',
    email: 'hoangnamle@gmail.com',
    phone: '0934567890',
    dateOfBirth: '2006-11-08',
    gender: 'male',
    address: '789 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    school: 'THPT Chu Văn An',
    parentName: 'Lê Văn Hùng',
    parentPhone: '0965432109',
    campus: 'CS001',
    currentClass: 'LH001',
    enrollDate: '2024-01-20',
    status: 'active',
    avatar: 'namlh.jpg',
  },
  {
    id: 'HV004',
    code: 'HV004',
    fullName: 'Phạm Thu Trang',
    username: 'trangpt',
    email: 'thutrangpham@gmail.com',
    phone: '0945678901',
    dateOfBirth: '2005-05-30',
    gender: 'female',
    address: '321 Lê Duẩn, Ba Đình, Hà Nội',
    school: 'Đại học Sư phạm Hà Nội',
    parentName: 'Phạm Thị Hoa',
    parentPhone: '0954321098',
    campus: 'CS002',
    currentClass: 'LH003',
    enrollDate: '2024-03-10',
    status: 'active',
    avatar: 'trangpt.jpg',
  },
  {
    id: 'HV005',
    code: 'HV005',
    fullName: 'Võ Minh Tuấn',
    username: 'tuanvm',
    email: 'tuanvo2005@gmail.com',
    phone: '0956781234',
    dateOfBirth: '2005-09-12',
    gender: 'male',
    address: '45 Đê La Thành, Đống Đa, Hà Nội',
    school: 'Đại học Bách Khoa Hà Nội',
    parentName: 'Võ Văn Hải',
    parentPhone: '0987123456',
    campus: 'CS001',
    currentClass: 'LH001',
    enrollDate: '2024-04-01',
    status: 'active',
    avatar: 'tuanvm.jpg',
  },
  {
    id: 'HV006',
    code: 'HV006',
    fullName: 'Đỗ Thị Hương',
    username: 'huongdt',
    email: 'huongdo2006@gmail.com',
    phone: '0967892345',
    dateOfBirth: '2006-02-28',
    gender: 'female',
    address: '78 Giảng Võ, Ba Đình, Hà Nội',
    school: 'THPT Chu Văn An',
    parentName: 'Đỗ Văn Long',
    parentPhone: '0978234567',
    campus: 'CS001',
    currentClass: 'LH001',
    enrollDate: '2024-05-15',
    status: 'active',
    avatar: 'huongdt.jpg',
  },
  {
    id: 'HV007',
    code: 'HV007',
    fullName: 'Bùi Quang Huy',
    username: 'huybq',
    email: 'huybui2005@gmail.com',
    phone: '0978903456',
    dateOfBirth: '2005-12-10',
    gender: 'male',
    address: '234 Xã Đàn, Đống Đa, Hà Nội',
    school: 'Đại học Quốc gia Hà Nội',
    parentName: 'Bùi Văn Thắng',
    parentPhone: '0989345678',
    campus: 'CS002',
    currentClass: 'LH003',
    enrollDate: '2024-06-01',
    status: 'active',
    avatar: 'huybq.jpg',
  },
  {
    id: 'HV008',
    code: 'HV008',
    fullName: 'Ngô Thị Linh',
    username: 'linhnt',
    email: 'linhngo2006@gmail.com',
    phone: '0989014567',
    dateOfBirth: '2006-04-18',
    gender: 'female',
    address: '56 Láng Hạ, Đống Đa, Hà Nội',
    school: 'THPT Nguyễn Huệ',
    parentName: 'Ngô Văn Tùng',
    parentPhone: '0990456789',
    campus: 'CS001',
    currentClass: 'LH001',
    enrollDate: '2024-07-10',
    status: 'active',
    avatar: 'linhnt.jpg',
  },
  {
    id: 'HV009',
    code: 'HV009',
    fullName: 'Trương Văn Đức',
    username: 'ductv',
    email: 'ductruong2005@gmail.com',
    phone: '0991125678',
    dateOfBirth: '2005-08-25',
    gender: 'male',
    address: '90 Hoàng Cầu, Đống Đa, Hà Nội',
    school: 'Đại học Ngoại ngữ - ĐHQGHN',
    parentName: 'Trương Văn Nam',
    parentPhone: '0992567890',
    campus: 'CS002',
    currentClass: 'LH004',
    enrollDate: '2024-08-01',
    status: 'active',
    avatar: 'ductv.jpg',
  },
  {
    id: 'HV010',
    code: 'HV010',
    fullName: 'Hoàng Thị Mai',
    username: 'maiht',
    email: 'maihoang2006@gmail.com',
    phone: '0993236789',
    dateOfBirth: '2006-03-14',
    gender: 'female',
    address: '12 Kim Mã, Ba Đình, Hà Nội',
    school: 'THPT Amsterdam',
    parentName: 'Hoàng Văn Bình',
    parentPhone: '0994678901',
    campus: 'CS001',
    currentClass: 'LH001',
    enrollDate: '2024-09-05',
    status: 'active',
    avatar: 'maiht.jpg',
  },
  {
    id: 'HV011',
    code: 'HV011',
    fullName: 'Đinh Minh Khoa',
    username: 'khoadm',
    email: 'khoaminh2005@gmail.com',
    phone: '0995347890',
    dateOfBirth: '2005-11-20',
    gender: 'male',
    address: '67 Thái Hà, Đống Đa, Hà Nội',
    school: 'Đại học Thương mại',
    parentName: 'Đinh Văn Trung',
    parentPhone: '0996789012',
    campus: 'CS002',
    currentClass: 'LH003',
    enrollDate: '2024-10-01',
    status: 'active',
    avatar: 'khoadm.jpg',
  },
  {
    id: 'HV012',
    code: 'HV012',
    fullName: 'Phan Thị Ngọc',
    username: 'ngocpt',
    email: 'ngocphan2006@gmail.com',
    phone: '0997458901',
    dateOfBirth: '2006-01-08',
    gender: 'female',
    address: '89 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    school: 'THPT Lê Quý Đôn',
    parentName: 'Phan Văn Minh',
    parentPhone: '0998890123',
    campus: 'CS001',
    currentClass: 'LH001',
    enrollDate: '2024-11-01',
    status: 'active',
    avatar: 'ngocpt.jpg',
  },
];

// Teachers Data
export const teachers: Teacher[] = [
  {
    id: 'GV001',
    code: 'GV001',
    fullName: 'Nguyễn Thị Mai Lan',
    username: 'lanntm',
    email: 'mailanteacher@gmail.com',
    phone: '0981234567',
    dateOfBirth: '1990-04-12',
    gender: 'female',
    address: '15 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    campus: 'CS001',
    bio: 'Giáo viên với 8 năm kinh nghiệm giảng dạy IELTS. Tốt nghiệp Đại học Ngoại ngữ - ĐHQGHN. Chuyên môn Speaking và Writing.',
    ieltsScore: 8.5,
    ieltsProof: { fileName: 'ielts_lanntm.pdf', uploadedAt: '2023-05-10' },
    toeicScore: 990,
    toeicProof: { fileName: 'toeic_lanntm.pdf', uploadedAt: '2023-05-10' },
    toeflScore: 115,
    toeflProof: { fileName: 'toefl_lanntm.pdf', uploadedAt: '2023-05-10' },
    certificates: ['TESOL', 'CELTA', 'IELTS 8.5'],
    certificateProofs: {
      'TESOL': { fileName: 'tesol_lanntm.pdf', uploadedAt: '2023-05-10' },
      'CELTA': { fileName: 'celta_lanntm.pdf', uploadedAt: '2023-05-10' },
      'IELTS 8.5': { fileName: 'ielts_8.5_lanntm.pdf', uploadedAt: '2023-05-10' },
    },
    specialization: ['IELTS Speaking', 'IELTS Writing', 'Academic English'],
    joinDate: '2020-08-01',
    status: 'active',
    avatar: 'lanntm.jpg',
  },
  {
    id: 'GV002',
    code: 'GV002',
    fullName: 'Trần Văn Bình',
    username: 'binhtv',
    email: 'binhteacher.hn@gmail.com',
    phone: '0972345678',
    dateOfBirth: '1988-09-25',
    gender: 'male',
    address: '89 Láng Hạ, Đống Đa, Hà Nội',
    campus: 'CS002',
    bio: '10 năm kinh nghiệm giảng dạy IELTS và TOEIC. Thạc sĩ Ngôn ngữ Anh tại ĐH Michigan, Mỹ. Chuyên về Reading và Listening.',
    ieltsScore: 8.0,
    ieltsProof: { fileName: 'ielts_binhtv.pdf', uploadedAt: '2023-05-10' },
    toeicScore: 980,
    toeicProof: { fileName: 'toeic_binhtv.pdf', uploadedAt: '2023-05-10' },
    certificates: ['IELTS 8.0', 'TOEIC 980', 'MA in English Linguistics'],
    certificateProofs: {
      'IELTS 8.0': { fileName: 'ielts_8.0_binhtv.pdf', uploadedAt: '2023-05-10' },
      'TOEIC 980': { fileName: 'toeic_980_binhtv.pdf', uploadedAt: '2023-05-10' },
      'MA in English Linguistics': { fileName: 'ma_binhtv.pdf', uploadedAt: '2023-05-10' },
    },
    specialization: ['IELTS Reading', 'IELTS Listening', 'IELTS Intermediate'],
    joinDate: '2019-06-15',
    status: 'active',
    avatar: 'binhtv.jpg',
  },
  {
    id: 'GV003',
    code: 'GV003',
    fullName: 'Lê Thị Phương Anh',
    username: 'anhltpt',
    email: 'phuonganh.english@gmail.com',
    phone: '0963456789',
    dateOfBirth: '1992-12-05',
    gender: 'female',
    address: '234 Trường Chinh, Thanh Xuân, Hà Nội',
    campus: 'CS001',
    bio: 'Giáo viên trẻ năng động với 5 năm kinh nghiệm. Tốt nghiệp loại xuất sắc ĐH Ngoại thương. Chuyên IELTS cho người mới bắt đầu.',
    ieltsScore: 7.5,
    ieltsProof: { fileName: 'ielts_anhltpt.pdf', uploadedAt: '2023-05-10' },
    toeicScore: 950,
    toeicProof: { fileName: 'toeic_anhltpt.pdf', uploadedAt: '2023-05-10' },
    certificates: ['IELTS 7.5', 'TOEIC 950', 'TKT'],
    certificateProofs: {
      'IELTS 7.5': { fileName: 'ielts_7.5_anhltpt.pdf', uploadedAt: '2023-05-10' },
      'TOEIC 950': { fileName: 'toeic_950_anhltpt.pdf', uploadedAt: '2023-05-10' },
      'TKT': { fileName: 'tkt_anhltpt.pdf', uploadedAt: '2023-05-10' },
    },
    specialization: ['IELTS Foundation', 'IELTS Speaking', 'IELTS Writing'],
    joinDate: '2021-09-01',
    status: 'active',
    avatar: 'anhltpt.jpg',
  },
  {
    id: 'GV004',
    code: 'GV004',
    fullName: 'Hoàng Minh Tuấn',
    username: 'tuanhm',
    email: 'tuanhoang.ielts@gmail.com',
    phone: '0954567890',
    dateOfBirth: '1985-06-18',
    gender: 'male',
    address: '567 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    campus: 'CS002',
    bio: 'Chuyên gia IELTS với 12 năm kinh nghiệm. Du học Úc 5 năm. Chuyên luyện thi IELTS 7.0+.',
    ieltsScore: 9.0,
    ieltsProof: { fileName: 'ielts_tuanhm.pdf', uploadedAt: '2023-05-10' },
    toeflScore: 120,
    toeflProof: { fileName: 'toefl_tuanhm.pdf', uploadedAt: '2023-05-10' },
    certificates: ['IELTS 9.0', 'TOEFL 120', 'DELTA', 'CELTA'],
    certificateProofs: {
      'IELTS 9.0': { fileName: 'ielts_9.0_tuanhm.pdf', uploadedAt: '2023-05-10' },
      'TOEFL 120': { fileName: 'toefl_120_tuanhm.pdf', uploadedAt: '2023-05-10' },
      'DELTA': { fileName: 'delta_tuanhm.pdf', uploadedAt: '2023-05-10' },
      'CELTA': { fileName: 'celta_tuanhm.pdf', uploadedAt: '2023-05-10' },
    },
    specialization: ['IELTS Advanced', 'IELTS All Skills', 'Exam Strategies'],
    joinDate: '2018-03-01',
    status: 'active',
    avatar: 'tuanhm.jpg',
  },
  {
    id: 'GV005',
    code: 'GV005',
    fullName: 'Phạm Thị Hà',
    username: 'hapt',
    email: 'hapham.toeic@gmail.com',
    phone: '0945678901',
    dateOfBirth: '1991-03-15',
    gender: 'female',
    address: '123 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    campus: 'CS001',
    bio: 'Giảng viên IELTS chuyên nghiệp với 7 năm kinh nghiệm. Tốt nghiệp ĐH Ngoại ngữ - ĐHQGHN.',
    ieltsScore: 7.5,
    ieltsProof: { fileName: 'ielts_hapt.pdf', uploadedAt: '2023-06-15' },
    toeicScore: 990,
    toeicProof: { fileName: 'toeic_hapt.pdf', uploadedAt: '2023-06-15' },
    certificates: ['IELTS 7.5', 'TOEIC 990', 'TESOL'],
    certificateProofs: {
      'IELTS 7.5': { fileName: 'ielts_7.5_hapt.pdf', uploadedAt: '2023-06-15' },
      'TOEIC 990': { fileName: 'toeic_990_hapt.pdf', uploadedAt: '2023-06-15' },
      'TESOL': { fileName: 'tesol_hapt.pdf', uploadedAt: '2023-06-15' },
    },
    specialization: ['IELTS Listening', 'IELTS Reading', 'IELTS Foundation'],
    joinDate: '2020-09-01',
    status: 'active',
    avatar: 'hapt.jpg',
  },
  {
    id: 'GV006',
    code: 'GV006',
    fullName: 'Vũ Thị Kim Anh',
    username: 'anhvtk',
    email: 'kimanhvu.business@gmail.com',
    phone: '0936789012',
    dateOfBirth: '1989-11-28',
    gender: 'female',
    address: '456 Kim Mã, Ba Đình, Hà Nội',
    campus: 'CS002',
    bio: 'Chuyên gia IELTS với 9 năm kinh nghiệm. MBA tại Singapore. Chuyên IELTS Writing và Academic English.',
    ieltsScore: 8.0,
    ieltsProof: { fileName: 'ielts_anhvtk.pdf', uploadedAt: '2023-07-20' },
    toeicScore: 980,
    toeicProof: { fileName: 'toeic_anhvtk.pdf', uploadedAt: '2023-07-20' },
    certificates: ['IELTS 8.0', 'TOEIC 980', 'MBA'],
    certificateProofs: {
      'IELTS 8.0': { fileName: 'ielts_8.0_anhvtk.pdf', uploadedAt: '2023-07-20' },
      'TOEIC 980': { fileName: 'toeic_980_anhvtk.pdf', uploadedAt: '2023-07-20' },
      'MBA': { fileName: 'mba_anhvtk.pdf', uploadedAt: '2023-07-20' },
    },
    specialization: ['IELTS Writing', 'IELTS Reading', 'Academic English'],
    joinDate: '2019-11-01',
    status: 'active',
    avatar: 'anhvtk.jpg',
  },
  {
    id: 'GV007',
    code: 'GV007',
    fullName: 'Đặng Quốc Việt',
    username: 'vietdq',
    email: 'vietdang.speaking@gmail.com',
    phone: '0927890123',
    dateOfBirth: '1993-07-09',
    gender: 'male',
    address: '789 Nguyễn Văn Cừ, Long Biên, Hà Nội',
    campus: 'CS001',
    bio: 'Giảng viên trẻ năng động, chuyên IELTS Speaking. Từng sống và học tập tại Anh 3 năm.',
    ieltsScore: 8.5,
    ieltsProof: { fileName: 'ielts_vietdq.pdf', uploadedAt: '2023-08-10' },
    toeflScore: 110,
    toeflProof: { fileName: 'toefl_vietdq.pdf', uploadedAt: '2023-08-10' },
    certificates: ['IELTS 8.5', 'TOEFL 110', 'CELTA'],
    certificateProofs: {
      'IELTS 8.5': { fileName: 'ielts_8.5_vietdq.pdf', uploadedAt: '2023-08-10' },
      'TOEFL 110': { fileName: 'toefl_110_vietdq.pdf', uploadedAt: '2023-08-10' },
      'CELTA': { fileName: 'celta_vietdq.pdf', uploadedAt: '2023-08-10' },
    },
    specialization: ['IELTS Speaking', 'Pronunciation', 'Conversation'],
    joinDate: '2021-01-15',
    status: 'active',
    avatar: 'vietdq.jpg',
  },
  {
    id: 'GV008',
    code: 'GV008',
    fullName: 'Ngô Thanh Tùng',
    username: 'tungnt',
    email: 'tungngo.toefl@gmail.com',
    phone: '0918901234',
    dateOfBirth: '1987-12-03',
    gender: 'male',
    address: '321 Cầu Giấy, Cầu Giấy, Hà Nội',
    campus: 'CS002',
    bio: 'Chuyên gia IELTS với 10 năm kinh nghiệm. Thạc sĩ Ngôn ngữ học tại Mỹ. Chuyên IELTS Advanced.',
    ieltsScore: 8.5,
    ieltsProof: { fileName: 'ielts_tungnt.pdf', uploadedAt: '2023-09-05' },
    toeflScore: 118,
    toeflProof: { fileName: 'toefl_tungnt.pdf', uploadedAt: '2023-09-05' },
    certificates: ['IELTS 8.5', 'TOEFL 118', 'MA Linguistics'],
    certificateProofs: {
      'IELTS 8.5': { fileName: 'ielts_8.5_tungnt.pdf', uploadedAt: '2023-09-05' },
      'TOEFL 118': { fileName: 'toefl_118_tungnt.pdf', uploadedAt: '2023-09-05' },
      'MA Linguistics': { fileName: 'ma_tungnt.pdf', uploadedAt: '2023-09-05' },
    },
    specialization: ['IELTS Advanced', 'IELTS Writing', 'Academic English'],
    joinDate: '2019-08-01',
    status: 'active',
    avatar: 'tungnt.jpg',
  },
  {
    id: 'GV009',
    code: 'GV009',
    fullName: 'Bùi Thị Thanh Thảo',
    username: 'thaobt',
    email: 'thaobui.kids@gmail.com',
    phone: '0909012345',
    dateOfBirth: '1994-05-21',
    gender: 'female',
    address: '567 Hoàng Mai, Hoàng Mai, Hà Nội',
    campus: 'CS001',
    bio: 'Giảng viên IELTS với 6 năm kinh nghiệm. Chuyên IELTS Foundation và phương pháp giảng dạy sáng tạo.',
    ieltsScore: 7.0,
    ieltsProof: { fileName: 'ielts_thaobt.pdf', uploadedAt: '2023-10-12' },
    certificates: ['IELTS 7.0', 'TESOL', 'TKT'],
    certificateProofs: {
      'IELTS 7.0': { fileName: 'ielts_7.0_thaobt.pdf', uploadedAt: '2023-10-12' },
      'TESOL': { fileName: 'tesol_thaobt.pdf', uploadedAt: '2023-10-12' },
      'TKT': { fileName: 'tkt_thaobt.pdf', uploadedAt: '2023-10-12' },
    },
    specialization: ['IELTS Foundation', 'IELTS Beginner', 'IELTS Listening'],
    joinDate: '2021-06-01',
    status: 'active',
    avatar: 'thaobt.jpg',
  },
  {
    id: 'GV010',
    code: 'GV010',
    fullName: 'Trần Minh Hằng',
    username: 'hangtm',
    email: 'hangtran.writing@gmail.com',
    phone: '0900123456',
    dateOfBirth: '1990-08-17',
    gender: 'female',
    address: '890 Láng, Đống Đa, Hà Nội',
    campus: 'CS002',
    bio: 'Chuyên gia IELTS Writing với 8 năm kinh nghiệm. Tác giả nhiều giáo trình Writing phổ biến.',
    ieltsScore: 8.5,
    ieltsProof: { fileName: 'ielts_hangtm.pdf', uploadedAt: '2023-11-08' },
    certificates: ['IELTS 8.5 (Writing 9.0)', 'DELTA', 'Published Author'],
    certificateProofs: {
      'IELTS 8.5 (Writing 9.0)': { fileName: 'ielts_8.5_hangtm.pdf', uploadedAt: '2023-11-08' },
      'DELTA': { fileName: 'delta_hangtm.pdf', uploadedAt: '2023-11-08' },
      'Published Author': { fileName: 'author_hangtm.pdf', uploadedAt: '2023-11-08' },
    },
    specialization: ['IELTS Writing Task 1', 'IELTS Writing Task 2', 'Academic Writing'],
    joinDate: '2020-02-01',
    status: 'active',
    avatar: 'hangtm.jpg',
  },
  {
    id: 'GV011',
    code: 'GV011',
    fullName: 'Trần Minh Anh',
    username: 'anhtm_gv',
    email: 'anhtran.advanced@gmail.com',
    phone: '0991234567',
    dateOfBirth: '1991-05-10',
    gender: 'male',
    address: '234 Láng Hạ, Đống Đa, Hà Nội',
    campus: 'CS002',
    bio: 'Giảng viên IELTS với 7 năm kinh nghiệm. Chuyên IELTS Listening và Cambridge materials. Từng du học tại Canada.',
    ieltsScore: 8.0,
    ieltsProof: { fileName: 'ielts_anhtm_gv.pdf', uploadedAt: '2023-12-01' },
    toeicScore: 975,
    toeicProof: { fileName: 'toeic_anhtm_gv.pdf', uploadedAt: '2023-12-01' },
    certificates: ['IELTS 8.0', 'TOEIC 975', 'TESOL'],
    certificateProofs: {
      'IELTS 8.0': { fileName: 'ielts_8.0_anhtm_gv.pdf', uploadedAt: '2023-12-01' },
      'TOEIC 975': { fileName: 'toeic_975_anhtm_gv.pdf', uploadedAt: '2023-12-01' },
      'TESOL': { fileName: 'tesol_anhtm_gv.pdf', uploadedAt: '2023-12-01' },
    },
    specialization: ['IELTS Listening', 'IELTS Reading', 'IELTS Intermediate'],
    joinDate: '2020-07-01',
    status: 'active',
    avatar: 'anhtm_gv.jpg',
  },
  {
    id: 'GV012',
    code: 'GV012',
    fullName: 'Nguyễn Văn Đạt',
    username: 'datnv',
    email: 'datnguyen.master@gmail.com',
    phone: '0982345678',
    dateOfBirth: '1989-11-15',
    gender: 'male',
    address: '567 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    campus: 'CS001',
    bio: 'Chuyên gia IELTS với 9 năm kinh nghiệm. Từng sống và làm việc tại Úc 4 năm. Chuyên IELTS Advanced và Master.',
    ieltsScore: 8.5,
    ieltsProof: { fileName: 'ielts_datnv.pdf', uploadedAt: '2023-12-05' },
    toeflScore: 115,
    toeflProof: { fileName: 'toefl_datnv.pdf', uploadedAt: '2023-12-05' },
    certificates: ['IELTS 8.5', 'TOEFL 115', 'CELTA', 'DELTA'],
    certificateProofs: {
      'IELTS 8.5': { fileName: 'ielts_8.5_datnv.pdf', uploadedAt: '2023-12-05' },
      'TOEFL 115': { fileName: 'toefl_115_datnv.pdf', uploadedAt: '2023-12-05' },
      'CELTA': { fileName: 'celta_datnv.pdf', uploadedAt: '2023-12-05' },
      'DELTA': { fileName: 'delta_datnv.pdf', uploadedAt: '2023-12-05' },
    },
    specialization: ['IELTS Advanced', 'IELTS Master', 'All Skills'],
    joinDate: '2019-09-01',
    status: 'active',
    avatar: 'datnv.jpg',
  },
];

// Academic Staff Data
export const academicStaff: AcademicStaff[] = [
  {
    id: 'AS001',
    code: 'AS001',
    fullName: 'Vũ Thị Thanh Hương',
    username: 'huongvtt',
    email: 'huongvtt@englishcomplex.edu.vn',
    phone: '0987123456',
    dateOfBirth: '1987-08-20',
    gender: 'female',
    address: '45 Tôn Đức Thắng, Đống Đa, Hà Nội',
    position: 'Trưởng phòng Học vụ',
    joinDate: '2019-01-10',
    status: 'active',
    avatar: 'huongvtt.jpg',
  },
];

// Director Data
export const directors: Director[] = [
  {
    id: 'GD001',
    fullName: 'Cấn Việt Đức',
    username: 'duccv',
    email: 'duc.cv@englishcomplex.edu.vn',
    phone: '0986922618',
    position: 'Giám đốc',
    avatar: 'duccv.jpg',
  },
];

// Notifications Data
export const notifications: Notification[] = [
  {
    id: 'NTF001',
    title: 'Thông báo lịch thi IELTS tháng 01/2025',
    content: 'Kính gửi các học viên, trung tâm thông báo lịch thi IELTS Mock Test diễn ra vào ngày 25/01/2025. Địa điểm: Cơ sở Long Biên. Thời gian: 8h00 - 12h00. Học viên vui lòng có mặt trước 15 phút.',
    type: 'exam',
    date: '2024-12-10',
    author: 'Vũ Thị Thanh Hương',
    isRead: false,
    targetRole: ['student', 'teacher', 'academic'],
  },
  {
    id: 'NTF002',
    title: 'Nghỉ Tết Nguyên Đán 2025',
    content: 'Trung tâm thông báo lịch nghỉ Tết Nguyên Đán Ất Tỵ 2025 từ ngày 26/01/2025 đến 02/02/2025. Các lớp học sẽ được bù vào cuối khóa. Chúc quý phụ huynh và các em năm mới an khang thịnh vượng!',
    type: 'holiday',
    date: '2024-12-08',
    author: 'Cấn Việt Đức',
    isRead: false,
    targetRole: ['student', 'teacher', 'academic', 'director'],
  },
  {
    id: 'NTF003',
    title: 'Sự kiện: Workshop "Tips đạt 8.0 IELTS Writing"',
    content: 'Trung tâm tổ chức workshop chia sẻ kinh nghiệm đạt điểm cao IELTS Writing với diễn giả Hoàng Minh Tuấn (IELTS 9.0). Thời gian: 14h00 Chủ nhật 22/12/2024. Địa điểm: Cơ sở Hai Bà Trưng. Miễn phí cho học viên.',
    type: 'event',
    date: '2024-12-05',
    author: 'Vũ Thị Thanh Hương',
    isRead: true,
    targetRole: ['student'],
  },
  {
    id: 'NTF004',
    title: 'Cập nhật quy định về điểm danh',
    content: 'Kể từ ngày 15/12/2024, trung tâm áp dụng quy định mới: Học viên vắng mặt quá 3 buổi không phép sẽ không được dự thi cuối khóa. Giáo viên cần điểm danh đầy đủ và chính xác trên hệ thống.',
    type: 'regulation',
    date: '2024-12-03',
    author: 'Vũ Thị Thanh Hương',
    isRead: false,
    targetRole: ['teacher', 'academic'],
  },
  {
    id: 'NTF005',
    title: 'Khai trương cơ sở mới tại Hai Bà Trưng',
    content: 'Trung tâm English Complex vui mừng thông báo khai trương cơ sở thứ 2 tại quận Hai Bà Trưng. Địa chỉ: 234 Ngõ Quỳnh, phường Bạch Mai. Ưu đãi giảm 20% học phí cho 50 học viên đăng ký đầu tiên!',
    type: 'general',
    date: '2024-11-28',
    author: 'Cấn Việt Đức',
    isRead: true,
    targetRole: ['student', 'teacher', 'academic', 'director'],
  },
];

export const centerInfo = {
  name: 'English Complex',
  fullName: 'Trung tâm Anh ngữ English Complex',
  fanpage: 'https://www.facebook.com/englishcomplex',
  director: {
    name: 'Cấn Việt Đức',
    phone: '0986.922.618',
    email: 'duc.cv@englishcomplex.edu.vn',
  },
  email: 'contact@englishcomplex.edu.vn',
  hotline: '1800 6969',
};

// Classes Data - Chỉ 4 khóa: Beginner, Intermediate, Advanced, Master
export const classes: Class[] = [
  // BEGINNER CLASSES
  {
    id: 'LH001',
    code: 'IELTS-BG-LB01',
    name: 'IELTS Beginner - LB01',
    level: 'Beginner',
    campus: 'Cơ sở Long Biên',
    room: 'Phòng 101',
    schedule: 'Thứ 2, Thứ 4, Thứ 6: 18h00 - 20h00',
    teacher: 'Lê Thị Phương Anh',
    startDate: '2024-09-01',
    endDate: '2025-01-15',
    totalStudents: 18,
    maxStudents: 20,
    status: 'active',
  },
  {
    id: 'LH002',
    code: 'IELTS-BG-LB02',
    name: 'IELTS Beginner - LB02',
    level: 'Beginner',
    campus: 'Cơ sở Long Biên',
    room: 'Phòng 102',
    schedule: 'Thứ 3, Thứ 5, Thứ 7: 18h00 - 20h00',
    teacher: 'Nguyễn Thị Mai Lan',
    startDate: '2024-09-15',
    endDate: '2025-02-01',
    totalStudents: 17,
    maxStudents: 20,
    status: 'active',
  },
  {
    id: 'LH009',
    code: 'IELTS-BG-HBT03',
    name: 'IELTS Beginner - HBT03',
    level: 'Beginner',
    campus: 'Cơ sở Hai Bà Trưng',
    room: 'Phòng 203',
    schedule: 'Thứ 7, Chủ nhật: 14h00 - 16h00',
    teacher: 'Đặng Quốc Việt',
    startDate: '2024-11-01',
    endDate: '2025-03-15',
    totalStudents: 15,
    maxStudents: 18,
    status: 'active',
  },
  
  // INTERMEDIATE CLASSES
  {
    id: 'LH003',
    code: 'IELTS-IM-HBT01',
    name: 'IELTS Intermediate - HBT01',
    level: 'Intermediate',
    campus: 'Cơ sở Hai Bà Trưng',
    room: 'Phòng 201',
    schedule: 'Thứ 2, Thứ 4, Thứ 6: 19h00 - 21h00',
    teacher: 'Trần Văn Bình',
    startDate: '2024-10-01',
    endDate: '2025-03-15',
    totalStudents: 16,
    maxStudents: 18,
    status: 'active',
  },
  {
    id: 'LH006',
    code: 'IELTS-IM-LB04',
    name: 'IELTS Intermediate - LB04',
    level: 'Intermediate',
    campus: 'Cơ sở Long Biên',
    room: 'Phòng 104',
    schedule: 'Thứ 7, Chủ nhật: 10h00 - 12h00',
    teacher: 'Nguyễn Thị Mai Lan',
    startDate: '2025-02-01',
    endDate: '2025-06-15',
    totalStudents: 0,
    maxStudents: 18,
    status: 'upcoming',
  },
  {
    id: 'LH010',
    code: 'IELTS-IM-LB05',
    name: 'IELTS Intermediate - LB05',
    level: 'Intermediate',
    campus: 'Cơ sở Long Biên',
    room: 'Phòng 105',
    schedule: 'Thứ 3, Thứ 5: 19h00 - 21h00',
    teacher: 'Trần Văn Bình',
    startDate: '2024-10-15',
    endDate: '2025-03-30',
    totalStudents: 14,
    maxStudents: 18,
    status: 'active',
  },
  
  // ADVANCED CLASSES
  {
    id: 'LH004',
    code: 'IELTS-AD-HBT02',
    name: 'IELTS Advanced - HBT02',
    level: 'Advanced',
    campus: 'Cơ sở Hai Bà Trưng',
    room: 'Phòng 202',
    schedule: 'Thứ 3, Thứ 5, Thứ 7: 19h00 - 21h00',
    teacher: 'Hoàng Minh Tuấn',
    startDate: '2024-10-15',
    endDate: '2025-04-01',
    totalStudents: 14,
    maxStudents: 15,
    status: 'active',
  },
  {
    id: 'LH011',
    code: 'IELTS-AD-LB06',
    name: 'IELTS Advanced - LB06',
    level: 'Advanced',
    campus: 'Cơ sở Long Biên',
    room: 'Phòng 106',
    schedule: 'Thứ 2, Thứ 4, Thứ 6: 20h00 - 22h00',
    teacher: 'Trần Minh Hằng',
    startDate: '2024-11-01',
    endDate: '2025-04-15',
    totalStudents: 12,
    maxStudents: 15,
    status: 'active',
  },
  
  // MASTER CLASSES
  {
    id: 'LH007',
    code: 'IELTS-MS-HBT04',
    name: 'IELTS Master - HBT04',
    level: 'Master',
    campus: 'Cơ sở Hai Bà Trưng',
    room: 'Phòng 204',
    schedule: 'Thứ 4, Thứ 6: 20h00 - 22h00',
    teacher: 'Trần Minh Hằng',
    startDate: '2024-10-01',
    endDate: '2025-02-28',
    totalStudents: 10,
    maxStudents: 12,
    status: 'active',
  },
  {
    id: 'LH008',
    code: 'IELTS-MS-LB07',
    name: 'IELTS Master - LB07',
    level: 'Master',
    campus: 'Cơ sở Long Biên',
    room: 'Phòng 107',
    schedule: 'Thứ 7, Chủ nhật: 16h00 - 18h00',
    teacher: 'Hoàng Minh Tuấn',
    startDate: '2024-11-15',
    endDate: '2025-03-30',
    totalStudents: 8,
    maxStudents: 12,
    status: 'active',
  },
];

// Schedules Data - Lịch học cụ thể cho từng buổi  
export const schedules: Schedule[] = updatedSchedules;