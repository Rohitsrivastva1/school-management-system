import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

// Get Timetable
export const getTimetable = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { classId, teacherId, dayOfWeek, academicYear } = req.query;

  const where: any = {
    schoolId,
    isActive: true,
  };

  if (classId) where.classId = classId;
  if (teacherId) where.teacherId = teacherId;
  if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek as string);
  if (academicYear) where.academicYear = academicYear;

  const timetable = await prisma.timetable.findMany({
    where,
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' },
    ],
  });

  res.json({
    success: true,
    data: timetable,
  });
});

// Get Timetable by Class
export const getTimetableByClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;
  const schoolId = req.user!.schoolId;
  const { academicYear } = req.query;

  const timetable = await prisma.timetable.findMany({
    where: {
      classId,
      schoolId,
      isActive: true,
      academicYear: academicYear as string || new Date().getFullYear().toString(),
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' },
    ],
  });

  // Group by day of week
  const groupedTimetable = {
    Monday: timetable.filter(t => t.dayOfWeek === 1),
    Tuesday: timetable.filter(t => t.dayOfWeek === 2),
    Wednesday: timetable.filter(t => t.dayOfWeek === 3),
    Thursday: timetable.filter(t => t.dayOfWeek === 4),
    Friday: timetable.filter(t => t.dayOfWeek === 5),
    Saturday: timetable.filter(t => t.dayOfWeek === 6),
    Sunday: timetable.filter(t => t.dayOfWeek === 0),
  };

  res.json({
    success: true,
    data: groupedTimetable,
  });
});

// Get Timetable by Teacher
export const getTimetableByTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { teacherId } = req.params;
  const schoolId = req.user!.schoolId;
  const { academicYear } = req.query;

  const timetable = await prisma.timetable.findMany({
    where: {
      teacherId,
      schoolId,
      isActive: true,
      academicYear: academicYear as string || new Date().getFullYear().toString(),
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' },
    ],
  });

  // Group by day of week
  const groupedTimetable = {
    Monday: timetable.filter(t => t.dayOfWeek === 1),
    Tuesday: timetable.filter(t => t.dayOfWeek === 2),
    Wednesday: timetable.filter(t => t.dayOfWeek === 3),
    Thursday: timetable.filter(t => t.dayOfWeek === 4),
    Friday: timetable.filter(t => t.dayOfWeek === 5),
    Saturday: timetable.filter(t => t.dayOfWeek === 6),
    Sunday: timetable.filter(t => t.dayOfWeek === 0),
  };

  res.json({
    success: true,
    data: groupedTimetable,
  });
});

// Create Timetable Entry
export const createTimetable = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const {
    classId,
    subjectId,
    teacherId,
    dayOfWeek,
    periodNumber,
    startTime,
    endTime,
    roomNumber,
    academicYear,
  } = req.body;

  // Validate required fields
  if (!classId || !subjectId || !teacherId || dayOfWeek === undefined || !periodNumber || !startTime || !endTime) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Missing required fields',
    });
    return;
  }

  // Check for conflicts (same class, day, period, academic year)
  const existingEntry = await prisma.timetable.findFirst({
    where: {
      classId,
      dayOfWeek: parseInt(dayOfWeek),
      periodNumber: parseInt(periodNumber),
      academicYear: academicYear || new Date().getFullYear().toString(),
      isActive: true,
    },
  });

  if (existingEntry) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'A timetable entry already exists for this class, day, and period',
    });
    return;
  }

  // Check if teacher is available at this time
  const teacherConflict = await prisma.timetable.findFirst({
    where: {
      teacherId,
      dayOfWeek: parseInt(dayOfWeek),
      periodNumber: parseInt(periodNumber),
      academicYear: academicYear || new Date().getFullYear().toString(),
      isActive: true,
    },
  });

  if (teacherConflict) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'Teacher is already assigned to another class at this time',
    });
    return;
  }

  const timetable = await prisma.timetable.create({
    data: {
      schoolId,
      classId,
      subjectId,
      teacherId,
      dayOfWeek: parseInt(dayOfWeek),
      periodNumber: parseInt(periodNumber),
      startTime,
      endTime,
      roomNumber,
      academicYear: academicYear || new Date().getFullYear().toString(),
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Timetable entry created successfully',
    data: timetable,
  });
});

// Update Timetable Entry
export const updateTimetable = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;
  const {
    classId,
    subjectId,
    teacherId,
    dayOfWeek,
    periodNumber,
    startTime,
    endTime,
    roomNumber,
    academicYear,
  } = req.body;

  // Check if timetable entry exists
  const existingEntry = await prisma.timetable.findFirst({
    where: {
      id,
      schoolId,
    },
  });

  if (!existingEntry) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Timetable entry not found',
    });
    return;
  }

  // Check for conflicts (excluding current entry)
  const conflictEntry = await prisma.timetable.findFirst({
    where: {
      classId: classId || existingEntry.classId,
      dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : existingEntry.dayOfWeek,
      periodNumber: periodNumber !== undefined ? parseInt(periodNumber) : existingEntry.periodNumber,
      academicYear: academicYear || existingEntry.academicYear,
      isActive: true,
      id: { not: id },
    },
  });

  if (conflictEntry) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'A timetable entry already exists for this class, day, and period',
    });
    return;
  }

  // Check teacher availability
  if (teacherId && teacherId !== existingEntry.teacherId) {
    const teacherConflict = await prisma.timetable.findFirst({
      where: {
        teacherId,
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : existingEntry.dayOfWeek,
        periodNumber: periodNumber !== undefined ? parseInt(periodNumber) : existingEntry.periodNumber,
        academicYear: academicYear || existingEntry.academicYear,
        isActive: true,
        id: { not: id },
      },
    });

    if (teacherConflict) {
      res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Teacher is already assigned to another class at this time',
      });
      return;
    }
  }

  const updatedTimetable = await prisma.timetable.update({
    where: { id },
    data: {
      classId: classId || existingEntry.classId,
      subjectId: subjectId || existingEntry.subjectId,
      teacherId: teacherId || existingEntry.teacherId,
      dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : existingEntry.dayOfWeek,
      periodNumber: periodNumber !== undefined ? parseInt(periodNumber) : existingEntry.periodNumber,
      startTime: startTime || existingEntry.startTime,
      endTime: endTime || existingEntry.endTime,
      roomNumber: roomNumber !== undefined ? roomNumber : existingEntry.roomNumber,
      academicYear: academicYear || existingEntry.academicYear,
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Timetable entry updated successfully',
    data: updatedTimetable,
  });
});

// Delete Timetable Entry
export const deleteTimetable = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  const existingEntry = await prisma.timetable.findFirst({
    where: {
      id,
      schoolId,
    },
  });

  if (!existingEntry) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Timetable entry not found',
    });
    return;
  }

  // Soft delete by setting isActive to false
  await prisma.timetable.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Timetable entry deleted successfully',
  });
});

// Get Timetable Stats
export const getTimetableStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { academicYear } = req.query;

  const year = academicYear as string || new Date().getFullYear().toString();

  const stats = await prisma.timetable.groupBy({
    by: ['dayOfWeek'],
    where: {
      schoolId,
      academicYear: year,
      isActive: true,
    },
    _count: {
      id: true,
    },
  });

  const totalEntries = await prisma.timetable.count({
    where: {
      schoolId,
      academicYear: year,
      isActive: true,
    },
  });

  const classCount = await prisma.timetable.groupBy({
    by: ['classId'],
    where: {
      schoolId,
      academicYear: year,
      isActive: true,
    },
  });

  const teacherCount = await prisma.timetable.groupBy({
    by: ['teacherId'],
    where: {
      schoolId,
      academicYear: year,
      isActive: true,
    },
  });

  res.json({
    success: true,
    data: {
      totalEntries,
      classesWithTimetable: classCount.length,
      teachersWithTimetable: teacherCount.length,
      entriesByDay: stats,
    },
  });
});
