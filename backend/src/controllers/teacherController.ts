import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

// Create Teacher
export const createTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { 
    firstName, 
    lastName, 
    email, 
    password, 
    phone, 
    qualification, 
    experienceYears, 
    subjects, 
    employeeId,
    isClassTeacher 
  } = req.body;

  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'School ID is required'
    });
    return;
  }

  // Check if teacher already exists
  const existingTeacher = await prisma.user.findUnique({
    where: { 
      schoolId_email: {
        schoolId,
        email
      }
    }
  });

  if (existingTeacher) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'Teacher with this email already exists'
    });
    return;
  }

  const passwordHash = await hashPassword(password);

  // Create teacher user and teacher record in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user record
    const user = await tx.user.create({
      data: {
        schoolId,
        email,
        passwordHash,
        role: UserRole.SUBJECT_TEACHER,
        firstName,
        lastName,
        phone,
        emailVerified: true,
      },
    });

    // Create teacher record
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        employeeId: employeeId || `EMP${Date.now()}`,
        qualification,
        subjects: subjects ? subjects.split(',').map((s: string) => s.trim()) : [],
        joiningDate: new Date(),
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        isClassTeacher: isClassTeacher || false,
      },
    });

    return { user, teacher };
  });

  const { user, teacher } = result;

  res.status(201).json({
    success: true,
    message: 'Teacher created successfully',
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      teacher: {
        id: teacher.id,
        employeeId: teacher.employeeId,
        qualification: teacher.qualification,
        experienceYears: teacher.experienceYears,
        isClassTeacher: teacher.isClassTeacher,
      }
    }
  });
});

// Get All Teachers
export const getTeachers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user?.schoolId;
  const { page = '1', limit = '10', search = '' } = req.query;

  if (!schoolId) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'School ID is required'
    });
    return;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const whereClause = {
    schoolId,
    role: {
      in: [UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER]
    },
    ...(search && {
      OR: [
        { firstName: { contains: search as string, mode: 'insensitive' as const } },
        { lastName: { contains: search as string, mode: 'insensitive' as const } },
        { email: { contains: search as string, mode: 'insensitive' as const } },
      ]
    })
  };

  const [teachers, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        teacher: true,
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where: whereClause })
  ]);

  res.status(200).json({
    success: true,
    data: {
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phone: teacher.phone,
        role: teacher.role,
        isActive: teacher.isActive,
        createdAt: teacher.createdAt,
        teacher: teacher.teacher ? {
          id: teacher.teacher.id,
          employeeId: teacher.teacher.employeeId,
          qualification: teacher.teacher.qualification,
          experienceYears: teacher.teacher.experienceYears,
          isClassTeacher: teacher.teacher.isClassTeacher,
        } : null
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// Get Teacher by ID
export const getTeacherById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'School ID is required'
    });
    return;
  }

  const teacher = await prisma.user.findFirst({
    where: {
      id,
      schoolId,
      role: {
        in: [UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER]
      }
    },
    include: {
      teacher: true,
    }
  });

  if (!teacher) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Teacher not found'
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: teacher.id,
      email: teacher.email,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone,
      role: teacher.role,
      isActive: teacher.isActive,
      createdAt: teacher.createdAt,
      teacher: teacher.teacher ? {
        id: teacher.teacher.id,
        employeeId: teacher.teacher.employeeId,
        qualification: teacher.teacher.qualification,
        experienceYears: teacher.teacher.experienceYears,
        isClassTeacher: teacher.teacher.isClassTeacher,
      } : null
    }
  });
});

// Update Teacher
export const updateTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    qualification, 
    experienceYears, 
    employeeId,
    isClassTeacher,
    isActive,
    subjects
  } = req.body;

  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'School ID is required'
    });
    return;
  }

  // Check if teacher exists
  const existingTeacher = await prisma.user.findFirst({
    where: {
      id,
      schoolId,
      role: {
        in: [UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER]
      }
    },
    include: {
      teacher: true
    }
  });

  if (!existingTeacher) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Teacher not found'
    });
    return;
  }

  // Check if email is being changed and if it conflicts
  if (email && email !== existingTeacher.email) {
    const emailConflict = await prisma.user.findUnique({
      where: {
        schoolId_email: {
          schoolId,
          email
        }
      }
    });

    if (emailConflict) {
      res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Email already exists for another user'
      });
      return;
    }
  }

  // Update teacher in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update user record
    const user = await tx.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        isActive,
      },
    });

    // Update teacher record
    const teacher = await tx.teacher.update({
      where: { userId: id },
      data: {
        employeeId,
        qualification,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        isClassTeacher: isClassTeacher || false,
        subjects: subjects ? (Array.isArray(subjects) ? subjects : subjects.split(',').map((s: string) => s.trim())) : undefined,
      },
    });

    return { user, teacher };
  });

  const { user, teacher } = result;

  res.status(200).json({
    success: true,
    message: 'Teacher updated successfully',
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      teacher: {
        id: teacher.id,
        employeeId: teacher.employeeId,
        qualification: teacher.qualification,
        experienceYears: teacher.experienceYears,
        isClassTeacher: teacher.isClassTeacher,
      }
    }
  });
});

// Delete Teacher
export const deleteTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'School ID is required'
    });
    return;
  }

  // Check if teacher exists
  const existingTeacher = await prisma.user.findFirst({
    where: {
      id,
      schoolId,
      role: UserRole.SUBJECT_TEACHER
    }
  });

  if (!existingTeacher) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Teacher not found'
    });
    return;
  }

  // Delete teacher (cascade will handle teacher record)
  await prisma.user.delete({
    where: { id }
  });

  res.status(200).json({
    success: true,
    message: 'Teacher deleted successfully'
  });
});

// Get Teacher Statistics
export const getTeacherStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'School ID is required'
    });
    return;
  }

  const [totalTeachers, activeTeachers, classTeachers] = await Promise.all([
    prisma.user.count({
      where: {
        schoolId,
        role: UserRole.SUBJECT_TEACHER
      }
    }),
    prisma.user.count({
      where: {
        schoolId,
        role: UserRole.SUBJECT_TEACHER,
        isActive: true
      }
    }),
    prisma.teacher.count({
      where: {
        user: {
          schoolId
        },
        isClassTeacher: true
      }
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalTeachers,
      activeTeachers,
      classTeachers,
      inactiveTeachers: totalTeachers - activeTeachers
    }
  });
});

// Get Teacher's Subjects
export const getTeacherSubjects = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;

  try {
    // Get teacher's subjects from timetable (more accurate than the subjects array)
    const timetableSubjects = await prisma.timetable.findMany({
      where: {
        teacherId: userId,
        isActive: true,
        class: {
          schoolId
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
      distinct: ['subjectId']
    });

    // Extract unique subjects
    const subjects = timetableSubjects.map(tt => tt.subject);

    // If no subjects from timetable, fall back to teacher's subjects array
    if (subjects.length === 0) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          userId,
          user: {
            schoolId
          }
        },
        select: {
          subjects: true
        }
      });

      if (teacher && teacher.subjects.length > 0) {
        // Get subject details for the subjects in the array
        const subjectDetails = await prisma.subject.findMany({
          where: {
            schoolId,
            name: {
              in: teacher.subjects
            }
          },
          select: {
            id: true,
            name: true,
            code: true
          }
        });

        res.json({
          success: true,
          data: subjectDetails
        });
        return;
      }
    }

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch teacher subjects'
    });
  }
});
