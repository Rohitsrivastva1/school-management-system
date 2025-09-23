import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Create Class
export const createClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { name, section, academicYear, classTeacherId, maxStudents, roomNumber } = req.body;

  // Check if class already exists
  const existingClass = await prisma.class.findFirst({
    where: {
      schoolId,
      name,
      section,
      academicYear
    }
  });

  if (existingClass) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'Class with this name and section already exists for this academic year'
    });
    return;
  }

  // Verify class teacher exists and belongs to the same school
  if (classTeacherId) {
    const classTeacher = await prisma.user.findFirst({
      where: {
        id: classTeacherId,
        schoolId,
        role: { in: ['class_teacher', 'subject_teacher'] }
      }
    });

    if (!classTeacher) {
      res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: 'Invalid class teacher selected'
      });
      return;
    }
  }

  const newClass = await prisma.class.create({
    data: {
      schoolId,
      name,
      section,
      academicYear,
      classTeacherId,
      maxStudents: maxStudents || 40,
      roomNumber
    },
    include: {
      classTeacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: newClass,
    message: 'Class created successfully'
  });
});

// Get Classes List
export const getClasses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, academicYear, isActive } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = { schoolId };

  if (academicYear) {
    where.academicYear = academicYear;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [classes, total] = await Promise.all([
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
            students: true
          }
        }
      },
      skip,
      take,
      orderBy: [
        { academicYear: 'desc' },
        { name: 'asc' },
        { section: 'asc' }
      ]
    }),
    prisma.class.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: classes.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      academicYear: cls.academicYear,
      classTeacher: cls.classTeacher,
      maxStudents: cls.maxStudents,
      roomNumber: cls.roomNumber,
      isActive: cls.isActive,
      studentCount: cls._count.students,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Class Details
export const getClassDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;
  const schoolId = req.user!.schoolId;

  const classDetails = await prisma.class.findFirst({
    where: { id: classId, schoolId },
    include: {
      classTeacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      students: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              dateOfBirth: true,
              gender: true,
              isActive: true
            }
          }
        },
        orderBy: { rollNumber: 'asc' }
      },
      timetable: {
        include: {
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
        orderBy: [
          { dayOfWeek: 'asc' },
          { periodNumber: 'asc' }
        ]
      }
    }
  });

  if (!classDetails) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Class not found'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: classDetails.id,
      name: classDetails.name,
      section: classDetails.section,
      academicYear: classDetails.academicYear,
      classTeacher: classDetails.classTeacher,
      maxStudents: classDetails.maxStudents,
      roomNumber: classDetails.roomNumber,
      isActive: classDetails.isActive,
      students: classDetails.students.map((student: any) => ({
        id: student.id,
        rollNumber: student.rollNumber,
        admissionNumber: student.admissionNumber,
        admissionDate: student.admissionDate,
        fatherName: student.fatherName,
        motherName: student.motherName,
        fatherPhone: student.fatherPhone,
        motherPhone: student.motherPhone,
        isActive: student.isActive,
        user: student.user
      })),
      timetable: classDetails.timetable.map((period: any) => ({
        id: period.id,
        dayOfWeek: period.dayOfWeek,
        periodNumber: period.periodNumber,
        startTime: period.startTime,
        endTime: period.endTime,
        roomNumber: period.roomNumber,
        subject: period.subject,
        teacher: period.teacher
      })),
      createdAt: classDetails.createdAt,
      updatedAt: classDetails.updatedAt
    }
  });
});

// Update Class
export const updateClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;
  const schoolId = req.user!.schoolId;
  const { name, section, classTeacherId, maxStudents, roomNumber, isActive } = req.body;

  // Verify class exists and belongs to the same school
  const existingClass = await prisma.class.findFirst({
    where: { id: classId, schoolId }
  });

  if (!existingClass) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Class not found'
    });
    return;
  }

  // Verify class teacher if provided
  if (classTeacherId) {
    const classTeacher = await prisma.user.findFirst({
      where: {
        id: classTeacherId,
        schoolId,
        role: { in: ['class_teacher', 'subject_teacher'] }
      }
    });

    if (!classTeacher) {
      res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: 'Invalid class teacher selected'
      });
      return;
    }
  }

  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: {
      name,
      section,
      classTeacherId,
      maxStudents,
      roomNumber,
      isActive
    },
    include: {
      classTeacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: updatedClass,
    message: 'Class updated successfully'
  });
});

// Delete Class
export const deleteClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify class exists and belongs to the same school
  const existingClass = await prisma.class.findFirst({
    where: { id: classId, schoolId },
    include: {
      _count: {
        select: {
          students: true
        }
      }
    }
  });

  if (!existingClass) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Class not found'
    });
    return;
  }

  // Check if class has students
  if (existingClass._count.students > 0) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'Cannot delete class with existing students. Please transfer students first.'
    });
    return;
  }

  // Soft delete by setting isActive to false
  await prisma.class.update({
    where: { id: classId },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Class deactivated successfully'
  });
});

// Get Class Statistics
export const getClassStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { academicYear } = req.query;

  const where: any = { schoolId };
  if (academicYear) {
    where.academicYear = academicYear;
  }

  const [
    totalClasses,
    activeClasses,
    totalStudents,
    classesWithTeachers,
    averageClassSize
  ] = await Promise.all([
    prisma.class.count({ where }),
    prisma.class.count({ where: { ...where, isActive: true } }),
    prisma.student.count({
      where: {
        class: { schoolId },
        isActive: true
      }
    }),
    prisma.class.count({
      where: {
        ...where,
        classTeacherId: { not: null }
      }
    }),
    prisma.class.aggregate({
      where: { ...where, isActive: true },
      _avg: {
        maxStudents: true
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalClasses,
      activeClasses,
      totalStudents,
      classesWithTeachers,
      averageClassSize: averageClassSize._avg.maxStudents || 0,
      academicYear: academicYear || 'All'
    }
  });
});
