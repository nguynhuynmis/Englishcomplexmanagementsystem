-- ============================================
-- ENGLISH COMPLEX DATABASE SCHEMA
-- Based on ERD design
-- Version: 1.0
-- Date: 2024-12-14
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Table: accounts (Authentication)
CREATE TABLE accounts (
  id_account UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_accounts_username ON accounts(user_name);
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_status ON accounts(status);

-- Table: users (User profiles)
CREATE TABLE users (
  id_user UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_account UUID NOT NULL REFERENCES accounts(id_account) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'academic', 'director', 'teacher', 'student')),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_account)
);

CREATE INDEX idx_users_account ON users(id_account);
CREATE INDEX idx_users_role ON users(role);

-- Table: roles (RBAC - Role definitions)
CREATE TABLE roles (
  id_role UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: account_roles (Many-to-many: accounts ↔ roles)
CREATE TABLE account_roles (
  id_account UUID REFERENCES accounts(id_account) ON DELETE CASCADE,
  id_role UUID REFERENCES roles(id_role) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id_account, id_role)
);

CREATE INDEX idx_account_roles_account ON account_roles(id_account);
CREATE INDEX idx_account_roles_role ON account_roles(id_role);

-- Table: permissions (RBAC - Permission definitions)
CREATE TABLE permissions (
  id_permission UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL, -- e.g., 'students', 'classes', 'grades'
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'manage')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: role_permissions (Many-to-many: roles ↔ permissions)
CREATE TABLE role_permissions (
  id_role UUID REFERENCES roles(id_role) ON DELETE CASCADE,
  id_permission UUID REFERENCES permissions(id_permission) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id_role, id_permission)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(id_role);
CREATE INDEX idx_role_permissions_permission ON role_permissions(id_permission);

-- ============================================
-- ORGANIZATION TABLES
-- ============================================

-- Table: centers (Campuses/Branches)
CREATE TABLE centers (
  id_center UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_center VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  id_manager UUID REFERENCES users(id_user) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  capacity INTEGER DEFAULT 100,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_centers_manager ON centers(id_manager);
CREATE INDEX idx_centers_status ON centers(status);

-- ============================================
-- ACADEMIC TABLES
-- ============================================

-- Table: students (Student-specific data)
CREATE TABLE students (
  id_student UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  student_code VARCHAR(50) UNIQUE NOT NULL,
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100),
  current_level VARCHAR(10),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_user)
);

CREATE INDEX idx_students_user ON students(id_user);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_level ON students(current_level);

-- Table: teachers (Teacher-specific data)
CREATE TABLE teachers (
  id_teacher UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  teacher_code VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT,
  specialties TEXT[], -- Array of specialties: ['Speaking', 'Writing']
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[], -- Array of certs: ['CELTA', 'TESOL']
  hourly_rate DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_user)
);

CREATE INDEX idx_teachers_user ON teachers(id_user);
CREATE INDEX idx_teachers_code ON teachers(teacher_code);
CREATE INDEX idx_teachers_status ON teachers(status);

-- Table: class_levels (IELTS levels lookup)
CREATE TABLE class_levels (
  id_level UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_name VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'IELTS 4.0'
  level_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., '4.0'
  description TEXT,
  order_index INTEGER NOT NULL, -- For sorting: 1, 2, 3, 4
  target_band_score DECIMAL(2, 1), -- e.g., 4.0, 5.0, 6.0, 7.0
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_class_levels_code ON class_levels(level_code);
CREATE INDEX idx_class_levels_order ON class_levels(order_index);

-- Table: class (Classes/Courses)
CREATE TABLE class (
  id_class UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_code VARCHAR(50) UNIQUE NOT NULL,
  name_class VARCHAR(100) NOT NULL,
  id_center UUID NOT NULL REFERENCES centers(id_center) ON DELETE CASCADE,
  id_level UUID NOT NULL REFERENCES class_levels(id_level) ON DELETE RESTRICT,
  id_teacher UUID REFERENCES teachers(id_teacher) ON DELETE SET NULL,
  capacity INTEGER DEFAULT 15,
  current_students INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  room VARCHAR(50),
  schedule_summary TEXT, -- e.g., 'Mon, Wed, Fri 8:00-10:00'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_capacity CHECK (current_students <= capacity),
  CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_class_center ON class(id_center);
CREATE INDEX idx_class_level ON class(id_level);
CREATE INDEX idx_class_teacher ON class(id_teacher);
CREATE INDEX idx_class_status ON class(status);
CREATE INDEX idx_class_dates ON class(start_date, end_date);

-- Table: class_students (Junction table: students ↔ classes)
CREATE TABLE class_students (
  id_student UUID REFERENCES students(id_student) ON DELETE CASCADE,
  id_class UUID REFERENCES class(id_class) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  academic_year VARCHAR(10), -- e.g., '2024'
  period_data VARCHAR(20), -- e.g., 'Q1', 'Spring 2024'
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'transferred')),
  final_grade DECIMAL(3, 1), -- e.g., 6.5
  attendance_rate DECIMAL(5, 2), -- Percentage: 95.50
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id_student, id_class)
);

CREATE INDEX idx_class_students_student ON class_students(id_student);
CREATE INDEX idx_class_students_class ON class_students(id_class);
CREATE INDEX idx_class_students_status ON class_students(status);
CREATE INDEX idx_class_students_year ON class_students(academic_year);

-- Table: schedules (Class sessions)
CREATE TABLE schedules (
  id_schedule UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_class UUID NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  topic VARCHAR(200),
  lesson_plan TEXT,
  required_materials TEXT,
  homework_assigned TEXT,
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  actual_start_time TIME,
  actual_end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_session_times CHECK (end_time > start_time),
  CONSTRAINT check_actual_times CHECK (actual_end_time IS NULL OR actual_end_time > actual_start_time)
);

CREATE INDEX idx_schedules_class ON schedules(id_class);
CREATE INDEX idx_schedules_date ON schedules(session_date);
CREATE INDEX idx_schedules_cancelled ON schedules(is_cancelled);

-- ============================================
-- CONTENT TABLES
-- ============================================

-- Table: materials (Study materials)
CREATE TABLE materials (
  id_material UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_class UUID NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  material_type VARCHAR(50) CHECK (material_type IN ('pdf', 'video', 'audio', 'link', 'document', 'other')),
  file_url TEXT,
  file_size BIGINT, -- in bytes
  upload_date DATE DEFAULT CURRENT_DATE,
  id_uploader UUID REFERENCES users(id_user) ON DELETE SET NULL,
  is_required BOOLEAN DEFAULT FALSE,
  order_index INTEGER,
  tags TEXT[], -- Array of tags for search
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_materials_class ON materials(id_class);
CREATE INDEX idx_materials_type ON materials(material_type);
CREATE INDEX idx_materials_uploader ON materials(id_uploader);

-- Table: assignments (Homework/Assignments)
CREATE TABLE assignments (
  id_assignment UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_class UUID NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assignment_type VARCHAR(50) CHECK (assignment_type IN ('homework', 'quiz', 'exam', 'project', 'essay')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_points DECIMAL(5, 2) DEFAULT 100.00,
  id_creator UUID REFERENCES users(id_user) ON DELETE SET NULL,
  instructions TEXT,
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  allow_late_submission BOOLEAN DEFAULT FALSE,
  late_penalty_percent DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assignments_class ON assignments(id_class);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_type ON assignments(assignment_type);
CREATE INDEX idx_assignments_published ON assignments(is_published);

-- Table: assignment_submissions (Student submissions)
CREATE TABLE assignment_submissions (
  id_submission UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_assignment UUID NOT NULL REFERENCES assignments(id_assignment) ON DELETE CASCADE,
  id_student UUID NOT NULL REFERENCES students(id_student) ON DELETE CASCADE,
  submission_url TEXT,
  submission_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  grade DECIMAL(5, 2),
  graded_at TIMESTAMP WITH TIME ZONE,
  id_grader UUID REFERENCES users(id_user) ON DELETE SET NULL,
  feedback TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_assignment, id_student, attempt_number)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(id_assignment);
CREATE INDEX idx_submissions_student ON assignment_submissions(id_student);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON assignment_submissions(submitted_at);

-- Table: scores (Grades/Test results)
CREATE TABLE scores (
  id_score UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_student UUID NOT NULL REFERENCES students(id_student) ON DELETE CASCADE,
  id_class UUID NOT NULL REFERENCES class(id_class) ON DELETE CASCADE,
  exam_type VARCHAR(50) CHECK (exam_type IN ('midterm', 'final', 'quiz', 'speaking', 'writing', 'listening', 'reading', 'practice_test')),
  exam_date DATE NOT NULL,
  score_listening DECIMAL(3, 1),
  score_reading DECIMAL(3, 1),
  score_writing DECIMAL(3, 1),
  score_speaking DECIMAL(3, 1),
  overall_score DECIMAL(3, 1),
  id_grader UUID REFERENCES users(id_user) ON DELETE SET NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scores_student ON scores(id_student);
CREATE INDEX idx_scores_class ON scores(id_class);
CREATE INDEX idx_scores_exam_type ON scores(exam_type);
CREATE INDEX idx_scores_exam_date ON scores(exam_date);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

-- Table: feedbacks (User feedback)
CREATE TABLE feedbacks (
  id_feedback UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  id_class UUID REFERENCES class(id_class) ON DELETE SET NULL,
  id_teacher UUID REFERENCES teachers(id_teacher) ON DELETE SET NULL,
  feedback_type VARCHAR(50) CHECK (feedback_type IN ('course', 'teacher', 'facility', 'system', 'other')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'archived')),
  response TEXT,
  id_responder UUID REFERENCES users(id_user) ON DELETE SET NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_user ON feedbacks(id_user);
CREATE INDEX idx_feedbacks_class ON feedbacks(id_class);
CREATE INDEX idx_feedbacks_teacher ON feedbacks(id_teacher);
CREATE INDEX idx_feedbacks_type ON feedbacks(feedback_type);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);

-- Table: notifications (System notifications)
CREATE TABLE notifications (
  id_notification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  notification_type VARCHAR(50) CHECK (notification_type IN ('announcement', 'reminder', 'grade', 'assignment', 'schedule', 'system', 'personal')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_role VARCHAR(20), -- If NULL, send to all; otherwise specific role
  target_class UUID REFERENCES class(id_class) ON DELETE CASCADE,
  target_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
  id_creator UUID REFERENCES users(id_user) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_role ON notifications(target_role);
CREATE INDEX idx_notifications_class ON notifications(target_class);
CREATE INDEX idx_notifications_user ON notifications(target_user);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- AUDIT TABLE
-- ============================================

-- Table: system_logs (Audit trail)
CREATE TABLE system_logs (
  id_log UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id_user) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- e.g., 'create_student', 'update_grade', 'delete_class'
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'student', 'class', 'grade'
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) CHECK (status IN ('success', 'failed', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_logs_user ON system_logs(id_user);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_entity ON system_logs(entity_type, entity_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_status ON system_logs(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_updated_at BEFORE UPDATE ON class FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_students_updated_at BEFORE UPDATE ON class_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedbacks_updated_at BEFORE UPDATE ON feedbacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Update class current_students count automatically
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE class SET current_students = current_students + 1 WHERE id_class = NEW.id_class;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE class SET current_students = current_students - 1 WHERE id_class = OLD.id_class;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_class_student_count_trigger
AFTER INSERT OR DELETE ON class_students
FOR EACH ROW EXECUTE FUNCTION update_class_student_count();

-- ============================================
-- INITIAL DATA (Class levels)
-- ============================================

INSERT INTO class_levels (level_name, level_code, description, order_index, target_band_score) VALUES
  ('IELTS 4.0', '4.0', 'Beginner level - Foundation skills', 1, 4.0),
  ('IELTS 5.0', '5.0', 'Pre-intermediate - Building core competencies', 2, 5.0),
  ('IELTS 6.0', '6.0', 'Intermediate - Strengthening language proficiency', 3, 6.0),
  ('IELTS 7.0', '7.0', 'Advanced - Mastering IELTS skills', 4, 7.0);

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE accounts IS 'User authentication credentials';
COMMENT ON TABLE users IS 'User profile information';
COMMENT ON TABLE students IS 'Student-specific data extending users';
COMMENT ON TABLE teachers IS 'Teacher-specific data extending users';
COMMENT ON TABLE class IS 'Course/class information';
COMMENT ON TABLE class_students IS 'Junction table for student enrollment in classes';
COMMENT ON TABLE schedules IS 'Individual class session schedules';
COMMENT ON TABLE assignments IS 'Homework and assignments';
COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE scores IS 'Test scores and grades';
COMMENT ON TABLE system_logs IS 'Audit trail for all system actions';

-- ============================================
-- END OF SCHEMA
-- ============================================
