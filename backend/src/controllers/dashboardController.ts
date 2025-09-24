import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Admin Dashboard
export const getAdminDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { period = '30' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const [
    // Overview statistics
    totalStudents,
    totalTeachers,
    totalClasses,
    totalParents,
    
    // Attendance statistics
    attendanceStats,
    
    // Recent activities
    recentStudents,
    recentTeachers,
    recentAttendance,
    recentHomework,
    
    // Class performance
    classPerformance,
    
    // Teacher workload
    teacherWorkload,
    
    // System health
    systemHealth
  ] = await Promise.all([
    // Total counts
    prisma.student.count({
      where: { 
        class: { schoolId },
        isActive: true 
      }
    }),
    prisma.teacher.count({
      where: { 
        user: { schoolId },
        isActive: true 
      }
    }),
    prisma.class.count({
      where: { 
        schoolId,
        isActive: true 
      }
    }),
    prisma.user.count({
      where: { 
        schoolId,
        role: 'parent',
        isActive: true 
      }
    }),
    
    // Attendance statistics
    prisma.attendance.aggregate({
      where: {
        student: { class: { schoolId } },
        date: { gte: startDate }
      },
      _count: { id: true }
    }),
    
    // Recent students
    prisma.student.findMany({
      where: { 
        class: { schoolId },
        isActive: true 
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    
    // Recent teachers
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
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    
    // Recent attendance
    prisma.attendance.findMany({
      where: {
        student: { class: { schoolId } },
        date: { gte: startDate }
      },
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
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Recent homework
    prisma.homework.findMany({
      where: {
        class: { schoolId },
        createdAt: { gte: startDate }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
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
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Class performance
    prisma.class.findMany({
      where: { 
        schoolId,
        isActive: true 
      },
      include: {
        _count: {
          select: {
            students: {
              where: { isActive: true }
            }
          }
        },
        classTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    
    // Teacher workload
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
            lastName: true
          }
        }
      }
    }),
    
    // System health
    prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_records,
        'students' as table_name
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ${schoolId}
      UNION ALL
      SELECT 
        COUNT(*) as total_records,
        'teachers' as table_name
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.school_id = ${schoolId}
    `
  ]);

  // Calculate attendance percentage
  const totalAttendanceRecords = attendanceStats._count.id;
  const presentRecords = await prisma.attendance.count({
    where: {
      student: { class: { schoolId } },
      date: { gte: startDate },
      status: 'present'
    }
  });
  const attendancePercentage = totalAttendanceRecords > 0 
    ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
    : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalParents,
        attendancePercentage,
        period: Number(period)
      },
      recentActivities: {
        students: recentStudents.map(student => ({
          id: student.id,
          user: student.user,
          class: student.class,
          admissionDate: student.admissionDate,
          createdAt: student.createdAt
        })),
        teachers: recentTeachers.map(teacher => ({
          id: teacher.id,
          user: teacher.user,
          employeeId: teacher.employeeId,
          joiningDate: teacher.joiningDate,
          createdAt: teacher.createdAt
        })),
        attendance: recentAttendance.map(attendance => ({
          id: attendance.id,
          student: attendance.student,
          status: attendance.status,
          date: attendance.date,
          markedBy: attendance.marker,
          createdAt: attendance.createdAt
        })),
        homework: recentHomework.map(homework => ({
          id: homework.id,
          title: homework.title,
          class: homework.class,
          subject: homework.subject,
          teacher: homework.teacher,
          dueDate: homework.dueDate,
          createdAt: homework.createdAt
        }))
      },
      classPerformance: classPerformance.map(cls => ({
        id: cls.id,
        name: cls.name,
        section: cls.section,
        studentCount: cls._count.students,
        classTeacher: cls.classTeacher,
        academicYear: cls.academicYear
      })),
      teacherWorkload: teacherWorkload.map(teacher => ({
        id: teacher.id,
        user: teacher.user,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects
      })),
      systemHealth: {
        totalRecords: systemHealth,
        lastUpdated: new Date().toISOString()
      }
    }
  });
});

// Teacher Dashboard
export const getTeacherDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { period = '30' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const [
    // Teacher's classes
    teacherClasses,
    
    // Today's schedule
    todaySchedule,
    
    // Recent attendance
    recentAttendance,
    
    // Pending homework
    pendingHomework,
    
    // Parent messages
    parentMessages,
    
    // Class statistics
    classStats
  ] = await Promise.all([
    // Teacher's classes
    prisma.class.findMany({
      where: {
        schoolId,
        OR: [
          { classTeacherId: userId },
          { 
            timetable: {
              some: {
                teacherId: userId,
                isActive: true
              }
            }
          }
        ],
        isActive: true
      },
      include: {
        _count: {
          select: {
            students: {
              where: { isActive: true }
            }
          }
        },
        timetable: {
          where: {
            teacherId: userId,
            isActive: true
          },
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    }),
    
    // Today's schedule
    prisma.timetable.findMany({
      where: {
        teacherId: userId,
        isActive: true,
        dayOfWeek: new Date().getDay()
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { periodNumber: 'asc' }
    }),
    
    // Recent attendance
    prisma.attendance.findMany({
      where: {
        student: {
          class: {
            OR: [
              { classTeacherId: userId },
              { 
                timetable: {
                  some: {
                    teacherId: userId,
                    isActive: true
                  }
                }
              }
            ]
          }
        },
        date: { gte: startDate }
      },
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Pending homework
    prisma.homework.findMany({
      where: {
        teacherId: userId,
        dueDate: { gte: new Date() },
        isPublished: true
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    }),
    
    // Parent messages (Q&A)
    prisma.qAMessage.findMany({
      where: {
        classTeacherId: userId,
        status: 'pending'
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    
    // Class statistics
    prisma.class.findMany({
      where: {
        schoolId,
        OR: [
          { classTeacherId: userId },
          { 
            timetable: {
              some: {
                teacherId: userId,
                isActive: true
              }
            }
          }
        ],
        isActive: true
      },
      include: {
        _count: {
          select: {
            students: {
              where: { isActive: true }
            },
            attendance: {
              where: {
                date: { gte: startDate },
                status: 'present'
              }
            }
          }
        }
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalClasses: teacherClasses.length,
        totalStudents: teacherClasses.reduce((sum, cls) => sum + cls._count.students, 0),
        pendingMessages: parentMessages.length,
        pendingHomework: pendingHomework.length,
        period: Number(period)
      },
      todaySchedule: todaySchedule.map(schedule => ({
        id: schedule.id,
        periodNumber: schedule.periodNumber,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        class: schedule.class,
        subject: schedule.subject,
        roomNumber: schedule.roomNumber
      })),
      recentAttendance: recentAttendance.map(attendance => ({
        id: attendance.id,
        student: attendance.student,
        status: attendance.status,
        date: attendance.date,
        createdAt: attendance.createdAt
      })),
      pendingHomework: pendingHomework.map(homework => ({
        id: homework.id,
        title: homework.title,
        class: homework.class,
        subject: homework.subject,
        dueDate: homework.dueDate,
        submissionCount: homework._count.submissions,
        createdAt: homework.createdAt
      })),
      parentMessages: parentMessages.map(message => ({
        id: message.id,
        message: message.message,
        priority: message.priority,
        parent: message.parent,
        student: message.student,
        createdAt: message.createdAt
      })),
      classStats: classStats.map(cls => ({
        id: cls.id,
        name: cls.name,
        section: cls.section,
        studentCount: cls._count.students,
        attendanceCount: cls._count.attendance,
        attendancePercentage: cls._count.students > 0 
          ? Math.round((cls._count.attendance / cls._count.students) * 100) 
          : 0
      }))
    }
  });
});

// Parent Dashboard
export const getParentDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const [
    // Parent's children
    children,
    
    // Recent attendance
    recentAttendance,
    
    // Recent homework
    recentHomework,
    
    // Recent grades
    recentGrades,
    
    // School announcements
    announcements,
    
    // Parent messages
    parentMessages
  ] = await Promise.all([
    // Parent's children
    prisma.student.findMany({
      where: {
        parentId: userId,
        class: { schoolId },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    }),
    
    // Recent attendance
    prisma.attendance.findMany({
      where: {
        student: {
          parentId: userId,
          class: { schoolId }
        },
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
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
        }
      },
      orderBy: { date: 'desc' },
      take: 20
    }),
    
    // Recent homework
    prisma.homework.findMany({
      where: {
        class: {
          students: {
            some: {
              parentId: userId,
              isActive: true
            }
          },
          schoolId
        },
        isPublished: true
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
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
        },
        submissions: {
          where: {
            student: {
              parentId: userId
            }
          },
          select: {
            id: true,
            studentId: true,
            submittedAt: true,
            grade: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Recent grades (if grades table exists)
    prisma.grade.findMany({
      where: {
        student: {
          parentId: userId,
          class: { schoolId }
        }
      },
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
        }
      },
      orderBy: { examDate: 'desc' },
      take: 10
    }).catch(() => []), // Gracefully handle if grades table doesn't exist
    
    // School announcements
    prisma.notification.findMany({
      where: {
        schoolId,
        OR: [
          { recipientType: 'all' },
          { 
            recipientClassId: {
              in: await prisma.student.findMany({
                where: { parentId: userId },
                select: { classId: true }
              }).then(students => students.map(s => s.classId))
            }
          }
        ],
        type: 'announcement'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Parent messages (Q&A)
    prisma.qAMessage.findMany({
      where: {
        parentId: userId
      },
      include: {
        classTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  res.json({
    success: true,
    data: {
      children: children.map(child => ({
        id: child.id,
        user: child.user,
        class: child.class,
        rollNumber: child.rollNumber,
        admissionDate: child.admissionDate
      })),
      recentAttendance: recentAttendance.map(attendance => ({
        id: attendance.id,
        student: attendance.student,
        status: attendance.status,
        date: attendance.date,
        remarks: attendance.remarks
      })),
      recentHomework: recentHomework.map(homework => ({
        id: homework.id,
        title: homework.title,
        class: homework.class,
        subject: homework.subject,
        teacher: homework.teacher,
        dueDate: homework.dueDate,
        submissions: homework.submissions,
        createdAt: homework.createdAt
      })),
      recentGrades: recentGrades.map(grade => ({
        id: grade.id,
        student: grade.student,
        subject: grade.subject,
        examType: grade.examType,
        examName: grade.examName,
        marksObtained: grade.marksObtained,
        totalMarks: grade.totalMarks,
        percentage: grade.percentage,
        grade: grade.grade,
        examDate: grade.examDate
      })),
      announcements: announcements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        sender: announcement.sender,
        createdAt: announcement.createdAt
      })),
      parentMessages: parentMessages.map(message => ({
        id: message.id,
        message: message.message,
        reply: message.reply,
        status: message.status,
        priority: message.priority,
        classTeacher: message.classTeacher,
        student: message.student,
        createdAt: message.createdAt,
        repliedAt: message.repliedAt
      }))
    },
    pagination: {
      page: Number(page),
      limit: Number(limit)
    }
  });
});

// Student Dashboard
export const getStudentDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;

  const [
    // Student info
    studentInfo,
    
    // Recent attendance
    recentAttendance,
    
    // Recent homework
    recentHomework,
    
    // Recent grades
    recentGrades,
    
    // Today's schedule
    todaySchedule
  ] = await Promise.all([
    // Student info
    prisma.student.findFirst({
      where: {
        userId,
        class: { schoolId },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    }),
    
    // Recent attendance
    prisma.attendance.findMany({
      where: {
        student: {
          userId,
          class: { schoolId }
        },
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
      orderBy: { date: 'desc' },
      take: 20
    }),
    
    // Recent homework
    prisma.homework.findMany({
      where: {
        class: {
          students: {
            some: {
              userId,
              isActive: true
            }
          },
          schoolId
        },
        isPublished: true
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
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
        },
        submissions: {
          where: {
            student: { userId }
          },
          select: {
            id: true,
            submittedAt: true,
            grade: true,
            feedback: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Recent grades
    prisma.grade.findMany({
      where: {
        student: {
          userId,
          class: { schoolId }
        }
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { examDate: 'desc' },
      take: 10
    }).catch(() => []), // Gracefully handle if grades table doesn't exist
    
    // Today's schedule
    prisma.timetable.findMany({
      where: {
        class: {
          students: {
            some: {
              userId,
              isActive: true
            }
          },
          schoolId
        },
        isActive: true,
        dayOfWeek: new Date().getDay()
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
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
      orderBy: { periodNumber: 'asc' }
    })
  ]);

  if (!studentInfo) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Student information not found'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      student: {
        id: studentInfo.id,
        user: studentInfo.user,
        class: studentInfo.class,
        rollNumber: studentInfo.rollNumber,
        admissionDate: studentInfo.admissionDate
      },
      recentAttendance: recentAttendance.map(attendance => ({
        id: attendance.id,
        status: attendance.status,
        date: attendance.date,
        remarks: attendance.remarks
      })),
      recentHomework: recentHomework.map(homework => ({
        id: homework.id,
        title: homework.title,
        class: homework.class,
        subject: homework.subject,
        teacher: homework.teacher,
        dueDate: homework.dueDate,
        submissions: homework.submissions,
        createdAt: homework.createdAt
      })),
      recentGrades: recentGrades.map(grade => ({
        id: grade.id,
        subject: grade.subject,
        examType: grade.examType,
        examName: grade.examName,
        marksObtained: grade.marksObtained,
        totalMarks: grade.totalMarks,
        percentage: grade.percentage,
        grade: grade.grade,
        examDate: grade.examDate
      })),
      todaySchedule: todaySchedule.map(schedule => ({
        id: schedule.id,
        periodNumber: schedule.periodNumber,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        class: schedule.class,
        subject: schedule.subject,
        teacher: schedule.teacher,
        roomNumber: schedule.roomNumber
      }))
    }
  });
});
