/**
 * BATCH UPDATE SCRIPT
 * This file contains code snippets to update all modules
 * Copy-paste these into each module file
 */

// ============================================
// TEMPLATE 1: ClassManagement
// ============================================

/*
Step 1: Update imports (line 1)
FROM:
  import { useState } from 'react';
TO:
  import { useState, useEffect } from 'react';

Step 2: Add API import (after other imports, around line 4)
ADD:
  import { classesAPI, studentsAPI, campusesAPI } from '../../utils/api';

Step 3: Update state initialization (around line 32)
FROM:
  const [classes, setClasses] = useState<ClassType[]>(initialClasses);
TO:
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

Step 4: Add loadData function (after state declarations)
ADD:
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [ClassManagement] Loading data...');
      const [classesResponse, studentsResponse] = await Promise.all([
        classesAPI.getAll(),
        studentsAPI.getAll()
      ]);
      console.log('✅ [ClassManagement] Data loaded:', classesResponse);
      setClasses(classesResponse.classes || []);
    } catch (err: any) {
      console.error('❌ [ClassManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

Step 5: Update handleSave in ClassFormModal callback
FIND: onSave prop callback
UPDATE TO:
  const handleSave = async (classData: ClassType) => {
    try {
      if (editingClass) {
        await classesAPI.update(classData.id, classData);
        setClasses(classes.map(c => c.id === classData.id ? classData : c));
      } else {
        const response = await classesAPI.create(classData);
        setClasses([...classes, response.class]);
      }
      setShowModal(false);
      setEditingClass(null);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

Step 6: Add loading/error UI in return statement
ADD after <h1> tag:
  {loading && (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
      <p className="text-gray-600">Đang tải dữ liệu...</p>
    </div>
  )}

  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-red-600">⚠️</div>
        <div>
          <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
      <button onClick={loadData} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
        Thử lại
      </button>
    </div>
  )}

  {!loading && !error && (
    // ... existing content ...
  )}
*/

// ============================================
// TEMPLATE 2: CampusManagement
// ============================================

/*
Step 1: Update imports
FROM:
  import { useState } from 'react';
TO:
  import { useState, useEffect } from 'react';

Step 2: Add API import
ADD:
  import { campusesAPI } from '../../utils/api';

Step 3: Update state
FROM:
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
TO:
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

Step 4: Add loadData
ADD:
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await campusesAPI.getAll();
      setCampuses(response.campuses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

Step 5: Update CRUD handlers
  const handleSave = async (campus: Campus) => {
    try {
      if (editingCampus) {
        await campusesAPI.update(campus.id, campus);
        setCampuses(campuses.map(c => c.id === campus.id ? campus : c));
      } else {
        const response = await campusesAPI.create(campus);
        setCampuses([...campuses, response.campus]);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa cơ sở?')) return;
    try {
      await campusesAPI.delete(id);
      setCampuses(campuses.filter(c => c.id !== id));
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
*/

// ============================================
// TEMPLATE 3: ScheduleManagement
// ============================================

/*
Step 1-4: Same as above (useState, useEffect, API import, loadData)

API: schedulesAPI, classesAPI

Step 5: Update handlers
  const handleSave = async (schedule: Schedule) => {
    try {
      if (editingSchedule) {
        await schedulesAPI.update(schedule.id, schedule);
        setSchedules(schedules.map(s => s.id === schedule.id ? schedule : s));
      } else {
        const response = await schedulesAPI.create(schedule);
        setSchedules([...schedules, response.schedule]);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
*/

// ============================================
// TEMPLATE 4: GradeManagement
// ============================================

/*
API: gradesAPI, studentsAPI, classesAPI

  const handleBatchSave = async (grades: Grade[]) => {
    try {
      await gradesAPI.batchUpdate(grades);
      await loadData(); // Reload to get updated data
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleSaveSingle = async (grade: Grade) => {
    try {
      if (grade.id) {
        await gradesAPI.update(grade.id, grade);
      } else {
        await gradesAPI.create(grade);
      }
      await loadData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
*/

// ============================================
// TEMPLATE 5: DocumentManagement
// ============================================

/*
API: documentsAPI, classesAPI

  const handleUpload = async (document: Document) => {
    try {
      const response = await documentsAPI.create(document);
      setDocuments([...documents, response.document]);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa tài liệu?')) return;
    try {
      await documentsAPI.delete(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
*/

// ============================================
// TEMPLATE 6: AssignmentManagement
// ============================================

/*
API: assignmentsAPI, classesAPI

  const handleSave = async (assignment: Assignment) => {
    try {
      if (editingAssignment) {
        await assignmentsAPI.update(assignment.id, assignment);
        setAssignments(assignments.map(a => a.id === assignment.id ? assignment : a));
      } else {
        const response = await assignmentsAPI.create(assignment);
        setAssignments([...assignments, response.assignment]);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa bài tập?')) return;
    try {
      await assignmentsAPI.delete(id);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
*/

// ============================================
// TEMPLATE 7: FeedbackManagement
// ============================================

/*
API: feedbackAPI

  const handleSubmit = async (feedback: Feedback) => {
    try {
      const response = await feedbackAPI.create(feedback);
      setFeedbacks([...feedbacks, response.feedback]);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (id: string, feedback: Partial<Feedback>) => {
    try {
      await feedbackAPI.update(id, feedback);
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, ...feedback } : f));
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
*/

// ============================================
// COMMON LOADING/ERROR UI COMPONENT
// ============================================

/*
Add this to every module's return statement:

{loading && (
  <div className="bg-white rounded-lg shadow p-12 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
    <p className="text-gray-600">Đang tải dữ liệu...</p>
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="text-red-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    </div>
    <button
      onClick={loadData}
      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
    >
      Thử lại
    </button>
  </div>
)}

{!loading && !error && (
  <>
    {/* Your existing content here */}
  </>
)}
*/

export {};
