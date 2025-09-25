import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Attendance Analytics
export const getAttendanceAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { 
    period = '30', 
    classId, 
    studentId, 
    startDate, 
    endDate,
    page = 1,
    limit = 20
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Calculate date range
  let dateStart: Date;
  let dateEnd: Date;

  if (startDate && endDate) {
    dateStart = new Date(startDate as string);
    dateEnd = new Date(endDate as string);
  } else {
    dateEnd = new Date();
    dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - Number(period));
  }

  // Build where clause based on user role
  const where: any = {
    student: {
      class: { schoolId }
    },
    date: {
      gte: dateStart,
      lte: dateEnd
    }
  };

  if (userRole === 'class_teacher') {
    where.student = {
      class: {
        schoolId,
        classTeacherId: userId
      }
    };
  }

  if (classId) {
    where.student = {
      ...where.student,
      classId: classId as string
    };
  }

  if (studentId) {
    where.studentId = studentId as string;
  }

  const [
    attendanceRecords,
    totalRecords,
    attendanceStats,
    dailyTrends,
    classWiseStats,
    studentWiseStats
  ] = await Promise.all([
    // Attendance records
    prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            class: {
              select: {
                id: true,
                name: true,
                section: true
              }
            }
          }
        },
        marker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      skip,
      take,
      orderBy: { date: 'desc' }
    }),
    
    // Total records count
    prisma.attendance.count({ where }),
    
    // Overall statistics
    prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    
    // Daily trends
    prisma.$queryRaw`
      SELECT 
        DATE(date) as date,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_count
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ${schoolId}
        AND a.date >= ${dateStart}
        AND a.date <= ${dateEnd}
      GROUP BY DATE(a.date)
      ORDER BY DATE(a.date) DESC
      LIMIT 30
    `,
    
    // Class-wise statistics
    prisma.$queryRaw`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        c.section,
        COUNT(a.id) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        ROUND(
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(a.id), 0), 2
        ) as attendance_percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ${schoolId}
        AND a.date >= ${dateStart}
        AND a.date <= ${dateEnd}
      GROUP BY c.id, c.name, c.section
      ORDER BY attendance_percentage DESC
    `,
    
    // Student-wise statistics
    prisma.$queryRaw`
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name,
        s.roll_number,
        c.name as class_name,
        c.section,
        COUNT(a.id) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        ROUND(
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(a.id), 0), 2
        ) as attendance_percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ${schoolId}
        AND a.date >= ${dateStart}
        AND a.date <= ${dateEnd}
      GROUP BY s.id, u.first_name, u.last_name, s.roll_number, c.name, c.section
      ORDER BY attendance_percentage DESC
      LIMIT 50
    `
  ]);

  const totalPages = Math.ceil(totalRecords / Number(limit));

  res.json({
    success: true,
    data: {
      overview: {
        totalRecords,
        period: Number(period),
        dateRange: {
          start: dateStart,
          end: dateEnd
        }
      },
      statistics: {
        byStatus: attendanceStats.map(stat => ({
          status: stat.status,
          count: stat._count.status
        })),
        totalPresent: attendanceStats.find(s => s.status === 'present')?._count.status || 0,
        totalAbsent: attendanceStats.find(s => s.status === 'absent')?._count.status || 0,
        totalLate: attendanceStats.find(s => s.status === 'late')?._count.status || 0,
        totalExcused: attendanceStats.find(s => s.status === 'excused')?._count.status || 0,
        overallPercentage: totalRecords > 0 
          ? Math.round(((attendanceStats.find(s => s.status === 'present')?._count.status || 0) / totalRecords) * 100)
          : 0
      },
      dailyTrends: dailyTrends,
      classWiseStats: classWiseStats,
      studentWiseStats: studentWiseStats,
      records: attendanceRecords.map(record => ({
        id: record.id,
        student: record.student,
        status: record.status,
        date: record.date,
        remarks: record.remarks,
        markedBy: record.marker,
        createdAt: record.createdAt
      }))
    },
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalRecords,
      totalPages
    }
  });
});

// Performance Analytics
export const getPerformanceAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { 
    period = '30', 
    classId, 
    studentId, 
    subjectId,
    examType,
    page = 1,
    limit = 20
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Calculate date range
  const dateEnd = new Date();
  const dateStart = new Date();
  dateStart.setDate(dateStart.getDate() - Number(period));

  // Build where clause
  const where: any = {
    student: {
      class: { schoolId }
    },
    examDate: {
      gte: dateStart,
      lte: dateEnd
    }
  };

  if (userRole === 'class_teacher') {
    where.student = {
      class: {
        schoolId,
        classTeacherId: userId
      }
    };
  }

  if (classId) {
    where.student = {
      ...where.student,
      classId: classId as string
    };
  }

  if (studentId) {
    where.studentId = studentId as string;
  }

  if (subjectId) {
    where.subjectId = subjectId as string;
  }

  if (examType) {
    where.examType = examType as string;
  }

  const [
    gradeRecords,
    totalRecords,
    performanceStats,
    subjectWiseStats,
    classWiseStats,
    studentWiseStats
  ] = await Promise.all([
    // Grade records
    prisma.grade.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            class: {
              select: {
                id: true,
                name: true,
                section: true
              }
            }
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      skip,
      take,
      orderBy: { examDate: 'desc' }
    }).catch(() => []), // Gracefully handle if grades table doesn't exist
    
    // Total records count
    prisma.grade.count({ where }).catch(() => 0),
    
    // Overall performance statistics
    prisma.grade.aggregate({
      where,
      _avg: { percentage: true },
      _min: { percentage: true },
      _max: { percentage: true },
      _count: { id: true }
    }).catch(() => ({
      _avg: { percentage: 0 },
      _min: { percentage: 0 },
      _max: { percentage: 0 },
      _count: { id: 0 }
    })),
    
    // Subject-wise statistics
    prisma.grade.groupBy({
      by: ['subjectId'],
      where,
      _avg: { percentage: true },
      _count: { subjectId: true }
    }).catch(() => []),
    
    // Class-wise statistics
    prisma.$queryRaw`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        c.section,
        COUNT(g.id) as total_exams,
        AVG(g.percentage) as average_percentage,
        MIN(g.percentage) as min_percentage,
        MAX(g.percentage) as max_percentage
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ${schoolId}
        AND g.exam_date >= ${dateStart}
        AND g.exam_date <= ${dateEnd}
      GROUP BY c.id, c.name, c.section
      ORDER BY average_percentage DESC
    `.catch(() => []),
    
    // Student-wise statistics
    prisma.$queryRaw`
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name,
        s.roll_number,
        c.name as class_name,
        c.section,
        COUNT(g.id) as total_exams,
        AVG(g.percentage) as average_percentage,
        MIN(g.percentage) as min_percentage,
        MAX(g.percentage) as max_percentage
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ${schoolId}
        AND g.exam_date >= ${dateStart}
        AND g.exam_date <= ${dateEnd}
      GROUP BY s.id, u.first_name, u.last_name, s.roll_number, c.name, c.section
      ORDER BY average_percentage DESC
      LIMIT 50
    `.catch(() => [])
  ]);

  const totalPages = Math.ceil(totalRecords / Number(limit));

  res.json({
    success: true,
    data: {
      overview: {
        totalRecords,
        period: Number(period),
        dateRange: {
          start: dateStart,
          end: dateEnd
        }
      },
      statistics: {
        averagePercentage: Math.round(Number(performanceStats._avg.percentage) || 0),
        minPercentage: Number(performanceStats._min.percentage) || 0,
        maxPercentage: Number(performanceStats._max.percentage) || 0,
        totalExams: performanceStats._count.id
      },
      subjectWiseStats: subjectWiseStats.map(stat => ({
        subjectId: stat.subjectId,
        averagePercentage: Math.round(Number(stat._avg.percentage) || 0),
        examCount: stat._count.subjectId
      })),
      classWiseStats: classWiseStats,
      studentWiseStats: studentWiseStats,
      records: gradeRecords.map(record => ({
        id: record.id,
        student: record.student,
        subject: record.subject,
        examType: record.examType,
        examName: record.examName,
        marksObtained: record.marksObtained,
        totalMarks: record.totalMarks,
        percentage: record.percentage,
        grade: record.grade,
        examDate: record.examDate,
        teacher: record.teacher,
        remarks: record.remarks
      }))
    },
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalRecords,
      totalPages
    }
  });
});

// Class Analytics
export const getClassAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { period = '30' } = req.query;

  const dateEnd = new Date();
  const dateStart = new Date();
  dateStart.setDate(dateStart.getDate() - Number(period));

  // Build where clause based on user role
  const where: any = { schoolId, isActive: true };

  if (userRole === 'class_teacher') {
    where.classTeacherId = userId;
  }

  const [
    classes,
    classStats,
    attendanceStats,
    homeworkStats
  ] = await Promise.all([
    // Classes
    prisma.class.findMany({
      where,
      include: {
        classTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            students: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    
    // Class statistics
    prisma.$queryRaw`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        c.section,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT a.id) as attendance_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        ROUND(
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(DISTINCT a.id), 0), 2
        ) as attendance_percentage
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id AND s.is_active = true
      LEFT JOIN attendance a ON s.id = a.student_id 
        AND a.date >= ${dateStart} 
        AND a.date <= ${dateEnd}
      WHERE c.school_id = ${schoolId} 
        AND c.is_active = true
      GROUP BY c.id, c.name, c.section
      ORDER BY c.name, c.section
    `,
    
    // Attendance statistics
    prisma.$queryRaw`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        c.section,
        DATE(a.date) as date,
        COUNT(a.id) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count
      FROM classes c
      JOIN students s ON c.id = s.class_id AND s.is_active = true
      JOIN attendance a ON s.id = a.student_id 
        AND a.date >= ${dateStart} 
        AND a.date <= ${dateEnd}
      WHERE c.school_id = ${schoolId} 
        AND c.is_active = true
      GROUP BY c.id, c.name, c.section, DATE(a.date)
      ORDER BY DATE(a.date) DESC
      LIMIT 100
    `,
    
    // Homework statistics
    prisma.$queryRaw`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        c.section,
        COUNT(h.id) as total_homework,
        COUNT(CASE WHEN h.is_published = true THEN 1 END) as published_homework,
        COUNT(CASE WHEN h.due_date >= NOW() THEN 1 END) as pending_homework
      FROM classes c
      LEFT JOIN homework h ON c.id = h.class_id 
        AND h.created_at >= ${dateStart}
      WHERE c.school_id = ${schoolId} 
        AND c.is_active = true
      GROUP BY c.id, c.name, c.section
      ORDER BY c.name, c.section
    `
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalClasses: classes.length,
        period: Number(period),
        dateRange: {
          start: dateStart,
          end: dateEnd
        }
      },
      classes: classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        section: cls.section,
        academicYear: cls.academicYear,
        classTeacher: cls.classTeacher,
        studentCount: cls._count.students,
        maxStudents: cls.maxStudents,
        roomNumber: cls.roomNumber
      })),
      classStats: classStats,
      attendanceStats: attendanceStats,
      homeworkStats: homeworkStats
    }
  });
});

// Teacher Analytics
export const getTeacherAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { period = '30' } = req.query;

  const dateEnd = new Date();
  const dateStart = new Date();
  dateStart.setDate(dateStart.getDate() - Number(period));

  const [
    teachers,
    teacherStats,
    workloadStats,
    performanceStats
  ] = await Promise.all([
    // Teachers
    prisma.teacher.findMany({
      where: {
        user: { schoolId },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    
    // Teacher statistics
    prisma.$queryRaw`
      SELECT 
        t.id as teacher_id,
        u.first_name,
        u.last_name,
        t.employee_id,
        COUNT(DISTINCT c.id) as class_count,
        COUNT(DISTINCT tt.id) as period_count,
        COUNT(DISTINCT h.id) as homework_count,
        COUNT(DISTINCT a.id) as attendance_records
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN classes c ON t.user_id = c.class_teacher_id AND c.is_active = true
      LEFT JOIN timetable tt ON t.user_id = tt.teacher_id AND tt.is_active = true
      LEFT JOIN homework h ON t.user_id = h.teacher_id 
        AND h.created_at >= ${dateStart}
      LEFT JOIN attendance a ON t.user_id = a.marked_by 
        AND a.date >= ${dateStart}
      WHERE u.school_id = ${schoolId} 
        AND t.is_active = true
      GROUP BY t.id, u.first_name, u.last_name, t.employee_id
      ORDER BY class_count DESC
    `,
    
    // Workload statistics
    prisma.$queryRaw`
      SELECT 
        t.id as teacher_id,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT tt.day_of_week) as working_days,
        COUNT(DISTINCT tt.period_number) as periods_per_day,
        COUNT(tt.id) as total_periods,
        COUNT(DISTINCT tt.class_id) as classes_taught,
        COUNT(DISTINCT tt.subject_id) as subjects_taught
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN timetable tt ON t.user_id = tt.teacher_id AND tt.is_active = true
      WHERE u.school_id = ${schoolId} 
        AND t.is_active = true
      GROUP BY t.id, u.first_name, u.last_name
      ORDER BY total_periods DESC
    `,
    
    // Performance statistics
    prisma.$queryRaw`
      SELECT 
        t.id as teacher_id,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT h.id) as homework_assigned,
        COUNT(DISTINCT hs.id) as homework_submissions,
        COUNT(DISTINCT a.id) as attendance_marked,
        ROUND(
          COUNT(DISTINCT hs.id) * 100.0 / 
          NULLIF(COUNT(DISTINCT h.id), 0), 2
        ) as homework_completion_rate
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN homework h ON t.user_id = h.teacher_id 
        AND h.created_at >= ${dateStart}
      LEFT JOIN homework_submissions hs ON h.id = hs.homework_id
      LEFT JOIN attendance a ON t.user_id = a.marked_by 
        AND a.date >= ${dateStart}
      WHERE u.school_id = ${schoolId} 
        AND t.is_active = true
      GROUP BY t.id, u.first_name, u.last_name
      ORDER BY homework_completion_rate DESC
    `
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalTeachers: teachers.length,
        period: Number(period),
        dateRange: {
          start: dateStart,
          end: dateEnd
        }
      },
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        user: teacher.user,
        employeeId: teacher.employeeId,
        qualification: teacher.qualification,
        subjects: teacher.subjects,
        joiningDate: teacher.joiningDate
      })),
      teacherStats: teacherStats,
      workloadStats: workloadStats,
      performanceStats: performanceStats
    }
  });
});

// Student Analytics
export const getStudentAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { 
    period = '30', 
    classId, 
    studentId,
    page = 1,
    limit = 20
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const dateEnd = new Date();
  const dateStart = new Date();
  dateStart.setDate(dateStart.getDate() - Number(period));

  // Build where clause based on user role
  const where: any = {
    class: { schoolId },
    isActive: true
  };

  if (userRole === 'class_teacher') {
    where.class = {
      schoolId,
      classTeacherId: userId
    };
  }

  if (userRole === 'parent') {
    where.parentId = userId;
  }

  if (classId) {
    where.classId = classId as string;
  }

  if (studentId) {
    where.id = studentId as string;
  }

  const [
    students,
    totalStudents,
    studentStats,
    attendanceStats,
    performanceStats
  ] = await Promise.all([
    // Students
    prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            classTeacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      skip,
      take,
      orderBy: { rollNumber: 'asc' }
    }),
    
    // Total students count
    prisma.student.count({ where }),
    
    // Student statistics
    prisma.$queryRaw`
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name,
        s.roll_number,
        c.name as class_name,
        c.section,
        COUNT(DISTINCT a.id) as attendance_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        ROUND(
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(DISTINCT a.id), 0), 2
        ) as attendance_percentage
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN attendance a ON s.id = a.student_id 
        AND a.date >= ${dateStart} 
        AND a.date <= ${dateEnd}
      WHERE c.school_id = ${schoolId} 
        AND s.is_active = true
      GROUP BY s.id, u.first_name, u.last_name, s.roll_number, c.name, c.section
      ORDER BY attendance_percentage DESC
      LIMIT 100
    `,
    
    // Attendance statistics
    prisma.$queryRaw`
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name,
        s.roll_number,
        c.name as class_name,
        c.section,
        DATE(a.date) as date,
        a.status,
        COUNT(a.id) as count
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      JOIN attendance a ON s.id = a.student_id 
        AND a.date >= ${dateStart} 
        AND a.date <= ${dateEnd}
      WHERE c.school_id = ${schoolId} 
        AND s.is_active = true
      GROUP BY s.id, u.first_name, u.last_name, s.roll_number, c.name, c.section, DATE(a.date), a.status
      ORDER BY DATE(a.date) DESC
      LIMIT 200
    `,
    
    // Performance statistics
    prisma.$queryRaw`
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name,
        s.roll_number,
        c.name as class_name,
        c.section,
        COUNT(g.id) as exam_count,
        AVG(g.percentage) as average_percentage,
        MIN(g.percentage) as min_percentage,
        MAX(g.percentage) as max_percentage
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN grades g ON s.id = g.student_id 
        AND g.exam_date >= ${dateStart}
      WHERE c.school_id = ${schoolId} 
        AND s.is_active = true
      GROUP BY s.id, u.first_name, u.last_name, s.roll_number, c.name, c.section
      ORDER BY average_percentage DESC
      LIMIT 100
    `.catch(() => [])
  ]);

  const totalPages = Math.ceil(totalStudents / Number(limit));

  res.json({
    success: true,
    data: {
      overview: {
        totalStudents,
        period: Number(period),
        dateRange: {
          start: dateStart,
          end: dateEnd
        }
      },
      students: students.map(student => ({
        id: student.id,
        user: student.user,
        class: student.class,
        parent: student.parent,
        rollNumber: student.rollNumber,
        admissionDate: student.admissionDate,
        admissionNumber: student.admissionNumber
      })),
      studentStats: studentStats,
      attendanceStats: attendanceStats,
      performanceStats: performanceStats
    },
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalStudents,
      totalPages
    }
  });
});

// School Analytics
export const getSchoolAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { period = '30' } = req.query;

  const dateEnd = new Date();
  const dateStart = new Date();
  dateStart.setDate(dateStart.getDate() - Number(period));

  const [
    schoolInfo,
    overviewStats,
    attendanceOverview,
    performanceOverview,
    recentActivities,
    systemHealth
  ] = await Promise.all([
    // School information
    prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        website: true,
        logoUrl: true,
        academicYearStart: true,
        academicYearEnd: true
      }
    }),
    
    // Overview statistics
    prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM students s JOIN classes c ON s."classId" = c.id WHERE c."schoolId" = ${schoolId} AND s."isActive" = true) as total_students,
        (SELECT COUNT(*) FROM teachers t JOIN users u ON t."userId" = u.id WHERE u."schoolId" = ${schoolId} AND t."isActive" = true) as total_teachers,
        (SELECT COUNT(*) FROM classes WHERE "schoolId" = ${schoolId} AND "isActive" = true) as total_classes,
        (SELECT COUNT(*) FROM users WHERE "schoolId" = ${schoolId} AND role = 'parent' AND "isActive" = true) as total_parents
    `,
    
    // Attendance overview
    prisma.$queryRaw`
      SELECT 
        COUNT(a.id) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        ROUND(
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(a.id), 0), 2
        ) as overall_attendance_percentage
      FROM attendance a
      JOIN students s ON a."studentId" = s.id
      JOIN classes c ON s."classId" = c.id
      WHERE c."schoolId" = ${schoolId}
        AND a.date >= ${dateStart}
        AND a.date <= ${dateEnd}
    `,
    
    // Performance overview
    prisma.$queryRaw`
      SELECT 
        COUNT(g.id) as total_exams,
        AVG(g.percentage) as average_percentage,
        MIN(g.percentage) as min_percentage,
        MAX(g.percentage) as max_percentage
      FROM grades g
      JOIN students s ON g."studentId" = s.id
      JOIN classes c ON s."classId" = c.id
      WHERE c."schoolId" = ${schoolId}
        AND g."examDate" >= ${dateStart}
        AND g."examDate" <= ${dateEnd}
    `.catch(() => ({
      total_exams: 0,
      average_percentage: 0,
      min_percentage: 0,
      max_percentage: 0
    })),
    
    // Recent activities
    prisma.$queryRaw`
      SELECT 
        'student_admission' as activity_type,
        s.id as record_id,
        u."firstName" as first_name,
        u."lastName" as last_name,
        s."createdAt" as activity_date
      FROM students s
      JOIN users u ON s."userId" = u.id
      JOIN classes c ON s."classId" = c.id
      WHERE c."schoolId" = ${schoolId}
        AND s."createdAt" >= ${dateStart}
      UNION ALL
      SELECT 
        'teacher_joining' as activity_type,
        t.id as record_id,
        u."firstName" as first_name,
        u."lastName" as last_name,
        t."createdAt" as activity_date
      FROM teachers t
      JOIN users u ON t."userId" = u.id
      WHERE u."schoolId" = ${schoolId}
        AND t."createdAt" >= ${dateStart}
      ORDER BY activity_date DESC
      LIMIT 20
    `,
    
    // System health
    prisma.$queryRaw`
      SELECT 
        'students' as table_name,
        COUNT(*) as record_count
      FROM students s
      JOIN classes c ON s."classId" = c.id
      WHERE c."schoolId" = ${schoolId}
      UNION ALL
      SELECT 
        'teachers' as table_name,
        COUNT(*) as record_count
      FROM teachers t
      JOIN users u ON t."userId" = u.id
      WHERE u."schoolId" = ${schoolId}
      UNION ALL
      SELECT 
        'classes' as table_name,
        COUNT(*) as record_count
      FROM classes
      WHERE "schoolId" = ${schoolId}
      UNION ALL
      SELECT 
        'attendance' as table_name,
        COUNT(*) as record_count
      FROM attendance a
      JOIN students s ON a."studentId" = s.id
      JOIN classes c ON s."classId" = c.id
      WHERE c."schoolId" = ${schoolId}
        AND a.date >= ${dateStart}
    `
  ]);

  // Helper function to convert BigInt to number
  const convertBigInt = (value: any): number => {
    if (typeof value === 'bigint') {
      return Number(value);
    }
    return value || 0;
  };

  // Helper function to safely process array data
  const processArrayData = (data: any, processor: (item: any) => any) => {
    if (Array.isArray(data)) {
      return data.map(processor);
    }
    return [];
  };

  res.json({
    success: true,
    data: {
      school: schoolInfo,
      overviewStats: processArrayData(overviewStats, (stat: any) => ({
        total_students: convertBigInt(stat.total_students),
        total_teachers: convertBigInt(stat.total_teachers),
        total_classes: convertBigInt(stat.total_classes),
        total_parents: convertBigInt(stat.total_parents)
      })),
      attendanceOverview: processArrayData(attendanceOverview, (stat: any) => ({
        total_records: convertBigInt(stat.total_records),
        present_count: convertBigInt(stat.present_count),
        absent_count: convertBigInt(stat.absent_count),
        overall_attendance_percentage: convertBigInt(stat.overall_attendance_percentage)
      })),
      performanceOverview: processArrayData(performanceOverview, (stat: any) => ({
        total_exams: convertBigInt(stat.total_exams),
        average_percentage: convertBigInt(stat.average_percentage),
        min_percentage: convertBigInt(stat.min_percentage),
        max_percentage: convertBigInt(stat.max_percentage)
      })),
      recentActivities: processArrayData(recentActivities, (activity: any) => ({
        ...activity,
        record_id: convertBigInt(activity.record_id)
      })),
      systemHealth: processArrayData(systemHealth, (health: any) => ({
        ...health,
        record_count: convertBigInt(health.record_count)
      })),
      overview: {
        totalStudents: convertBigInt((overviewStats as any)[0]?.total_students),
        totalTeachers: convertBigInt((overviewStats as any)[0]?.total_teachers),
        totalClasses: convertBigInt((overviewStats as any)[0]?.total_classes),
        totalParents: convertBigInt((overviewStats as any)[0]?.total_parents),
        period: Number(period),
        dateRange: {
          start: dateStart,
          end: dateEnd
        }
      },
      attendance: {
        totalRecords: convertBigInt((attendanceOverview as any)[0]?.total_records),
        presentCount: convertBigInt((attendanceOverview as any)[0]?.present_count),
        absentCount: convertBigInt((attendanceOverview as any)[0]?.absent_count),
        overallPercentage: convertBigInt((attendanceOverview as any)[0]?.overall_attendance_percentage)
      },
      performance: {
        totalExams: convertBigInt((performanceOverview as any)[0]?.total_exams),
        averagePercentage: Math.round(convertBigInt((performanceOverview as any)[0]?.average_percentage)),
        minPercentage: convertBigInt((performanceOverview as any)[0]?.min_percentage),
        maxPercentage: convertBigInt((performanceOverview as any)[0]?.max_percentage)
      }
    }
  });
});
