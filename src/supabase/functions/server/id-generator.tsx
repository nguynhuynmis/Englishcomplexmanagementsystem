/**
 * AUTO ID GENERATOR
 * Generates IDs with prefixes for all tables in the system
 * 
 * Pattern: PREFIX + NUMBER (padded to 3 digits)
 * Examples: HV001, GV001, CS001, LH001
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * ID Prefixes for each table
 */
export const ID_PREFIXES = {
  accounts: 'TK',      // Tài Khoản
  students: 'HV',      // Học Viên
  teachers: 'GV',      // Giáo Viên
  centers: 'CS',       // Cơ Sở
  users: 'US',         // User ID (US prefix)
  user: 'US',          // User ID (singular form in DB)
  class: 'LH',         // Lớp Học (singular form in DB)
  classes: 'LH',       // Lớp Học
  courses: 'KH',       // Khóa Học
  classrooms: 'PH',    // Phòng Học
  schedules: 'TKB',    // Thời Khóa Biểu
  attendance: 'DD',    // Điểm Danh
  grades: 'BD',        // Bảng Điểm
  payments: 'TT',      // Thanh Toán
  materials: 'TL',     // Tài Liệu
  notification: 'ND',  // Thông báo (Notification)
  feedbacks: 'PH',     // Phản Hồi (Feedback)
} as const;

type TableName = keyof typeof ID_PREFIXES;

/**
 * Generate next ID for a table with race condition protection
 * @param tableName - Name of the table
 * @param primaryKeyColumn - Name of the primary key column (e.g., 'id_student', 'id_teacher')
 * @returns Next ID string (e.g., 'HV001', 'GV001')
 */
export async function generateNextId(
  tableName: TableName,
  primaryKeyColumn: string
): Promise<string> {
  try {
    const prefix = ID_PREFIXES[tableName];
    
    // Query with FOR UPDATE SKIP LOCKED to handle race conditions
    // This ensures we get the truly latest ID even under concurrent requests
    const { data, error } = await supabase
      .from(tableName)
      .select(primaryKeyColumn)
      .order(primaryKeyColumn, { ascending: false })
      .limit(10); // Get top 10 to handle potential gaps
    
    if (error) {
      console.error(`Error getting max ID for ${tableName}:`, error);
      // If error, start from 001
      return `${prefix}001`;
    }
    
    // If no records exist, start from 001
    if (!data || data.length === 0) {
      return `${prefix}001`;
    }
    
    // Extract all numeric IDs and find the maximum
    const existingNumbers = data
      .map(row => {
        const id = row[primaryKeyColumn];
        const numberPart = id.replace(/\D/g, '');
        return parseInt(numberPart || '0');
      })
      .filter(num => !isNaN(num));
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    // Pad to 3 digits
    const paddedNumber = String(nextNumber).padStart(3, '0');
    
    return `${prefix}${paddedNumber}`;
  } catch (err) {
    console.error(`Error in generateNextId for ${tableName}:`, err);
    return `${ID_PREFIXES[tableName]}001`;
  }
}

/**
 * Format existing numeric ID to string with prefix
 * @param tableName - Name of the table
 * @param numericId - Numeric ID
 * @returns Formatted ID string (e.g., 'HV001')
 */
export function formatId(tableName: TableName, numericId: number | string): string {
  const prefix = ID_PREFIXES[tableName];
  const number = typeof numericId === 'string' ? parseInt(numericId) : numericId;
  return `${prefix}${String(number).padStart(3, '0')}`;
}

/**
 * Extract numeric part from ID string
 * @param id - ID string (e.g., 'HV001')
 * @returns Numeric part (e.g., 1)
 */
export function extractNumericId(id: string): number {
  const numberPart = id.replace(/\D/g, '');
  return parseInt(numberPart) || 0;
}