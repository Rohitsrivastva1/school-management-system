import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Mark Attendance
export const markAttendance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const teacherId = req.user!.userId;
  const { classId, date, attendanceData } = req.body;

  // Verify class exists and belongs to the same school
  const classExists = await prisma.class.findFirst({
    where: { id: classId, schoolId }
  });

  if (!classExists) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Class not found'
    });
    return;
  }

  // Check if attendance already marked for this date
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      classId,
      date: new Date(date)
    }
  });

  if (existingAttendance) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'Attendance already marked for this date'
    });
    return;
  }

  // Create attendance records
  const attendanceRecords = attendanceData.map((record: any) => ({
    studentId: record.studentId,
    classId,
    date: new Date(date),
    status: record.status,
    markedBy: teacherId,
    remarks: record.remarks || null
  }));

  const createdAttendance = await prisma.attendance.createMany({
    data: attendanceRecords
  });

  res.status(201).json({
    success: true,
    data: { count: createdAttendance.count },
    message: 'Attendance marked successfully'
  });
});

// Get Attendance by Class
export const getAttendanceByClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, date, startDate, endDate } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    classId,
    class: { schoolId }
  };

  if (date) {
    where.date = new Date(date as string);
  } else if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
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
      orderBy: [
        { date: 'desc' },
        { student: { rollNumber: 'asc' } }
      ]
    }),
    prisma.attendance.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: attendance.map((record: any) => ({
      id: record.id,
      studentId: record.studentId,
      student: {
        id: record.student.id,
        rollNumber: record.student.rollNumber,
        user: record.student.user
      },
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      markedBy: record.marker,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Attendance by Student
export const getAttendanceByStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { studentId } = req.params;
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, startDate, endDate } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    studentId,
    student: {
      class: { schoolId }
    }
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
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
    prisma.attendance.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: attendance.map((record: any) => ({
      id: record.id,
      class: record.class,
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      markedBy: record.marker,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Attendance Statistics
export const getAttendanceStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { classId, startDate, endDate } = req.query;

  const where: any = {
    class: { schoolId }
  };

  if (classId) {
    where.classId = classId;
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const [
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    excusedCount
  ] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.count({ where: { ...where, status: 'present' } }),
    prisma.attendance.count({ where: { ...where, status: 'absent' } }),
    prisma.attendance.count({ where: { ...where, status: 'late' } }),
    prisma.attendance.count({ where: { ...where, status: 'excused' } })
  ]);

  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  res.json({
    success: true,
    data: {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
    }
  });
});

// Update Attendance
export const updateAttendance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { attendanceId } = req.params;
  const schoolId = req.user!.schoolId;
  const { status, remarks } = req.body;

  // Verify attendance record exists and belongs to the same school
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      id: attendanceId,
      class: { schoolId }
    }
  });

  if (!existingAttendance) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Attendance record not found'
    });
    return;
  }

  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      status,
      remarks
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
          }
        }
      }
    }
  });

  res.json({
    success: true,
    data: {
      id: updatedAttendance.id,
      student: {
        id: updatedAttendance.student.id,
        rollNumber: updatedAttendance.student.rollNumber,
        user: updatedAttendance.student.user
      },
      date: updatedAttendance.date,
      status: updatedAttendance.status,
      remarks: updatedAttendance.remarks,
      updatedAt: updatedAttendance.updatedAt
    },
    message: 'Attendance updated successfully'
  });
});

// Delete Attendance
export const deleteAttendance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { attendanceId } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify attendance record exists and belongs to the same school
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      id: attendanceId,
      class: { schoolId }
    }
  });

  if (!existingAttendance) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Attendance record not found'
    });
    return;
  }

  await prisma.attendance.delete({
    where: { id: attendanceId }
  });

  res.json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});
