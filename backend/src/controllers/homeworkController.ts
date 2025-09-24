import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Create Homework
export const createHomework = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const teacherId = req.user!.userId;
  const { classId, subjectId, title, description, dueDate, attachments } = req.body;

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

  // Verify subject exists and belongs to the same school
  const subjectExists = await prisma.subject.findFirst({
    where: { id: subjectId, schoolId }
  });

  if (!subjectExists) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Subject not found'
    });
    return;
  }

  const newHomework = await prisma.homework.create({
    data: {
      classId,
      subjectId,
      teacherId,
      title,
      description,
      dueDate: new Date(dueDate),
      attachments: attachments || null
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
    }
  });

  res.status(201).json({
    success: true,
    data: {
      id: newHomework.id,
      title: newHomework.title,
      description: newHomework.description,
      dueDate: newHomework.dueDate,
      attachments: newHomework.attachments,
      isPublished: newHomework.isPublished,
      class: newHomework.class,
      subject: newHomework.subject,
      teacher: newHomework.teacher,
      createdAt: newHomework.createdAt,
      updatedAt: newHomework.updatedAt
    },
    message: 'Homework created successfully'
  });
});

// Get Homework List
export const getHomework = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, classId, subjectId, teacherId, isPublished } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    class: { schoolId }
  };

  if (classId) {
    where.classId = classId;
  }

  if (subjectId) {
    where.subjectId = subjectId;
  }

  if (teacherId) {
    where.teacherId = teacherId;
  }

  if (isPublished !== undefined) {
    where.isPublished = isPublished === 'true';
  }

  const [homework, total] = await Promise.all([
    prisma.homework.findMany({
      where,
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
        _count: {
          select: {
            submissions: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.homework.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: homework.map((hw: any) => ({
      id: hw.id,
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      attachments: hw.attachments,
      instructions: hw.instructions,
      isPublished: hw.isPublished,
      class: hw.class,
      subject: hw.subject,
      teacher: hw.teacher,
      submissionCount: hw._count.submissions,
      createdAt: hw.createdAt,
      updatedAt: hw.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Single Homework
export const getHomeworkById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { homeworkId } = req.params;
  const schoolId = req.user!.schoolId;

  const homework = await prisma.homework.findFirst({
    where: {
      id: homeworkId,
      class: { schoolId }
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
      }
    }
  });

  if (!homework) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Homework not found'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: homework.id,
      title: homework.title,
      description: homework.description,
      dueDate: homework.dueDate,
      attachments: homework.attachments,
      isPublished: homework.isPublished,
      class: homework.class,
      subject: homework.subject,
      teacher: homework.teacher,
      submissions: homework.submissions.map((submission: any) => ({
        id: submission.id,
        student: {
          id: submission.student.id,
          rollNumber: submission.student.rollNumber,
          user: submission.student.user
        },
        submissionText: submission.submissionText,
        attachments: submission.attachments,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
        grade: submission.grade,
        feedback: submission.feedback,
        isLate: submission.isLate
      })),
      createdAt: homework.createdAt,
      updatedAt: homework.updatedAt
    }
  });
});

// Get Homework by Class
export const getHomeworkByClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, isPublished } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    classId,
    class: { schoolId }
  };

  if (isPublished !== undefined) {
    where.isPublished = isPublished === 'true';
  }

  const [homework, total] = await Promise.all([
    prisma.homework.findMany({
      where,
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
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.homework.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: homework.map((hw: any) => ({
      id: hw.id,
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      attachments: hw.attachments,
      instructions: hw.instructions,
      isPublished: hw.isPublished,
      subject: hw.subject,
      teacher: hw.teacher,
      submissionCount: hw._count.submissions,
      createdAt: hw.createdAt,
      updatedAt: hw.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Homework by Teacher
export const getHomeworkByTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { teacherId } = req.params;
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, isPublished } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    teacherId,
    class: { schoolId }
  };

  if (isPublished !== undefined) {
    where.isPublished = isPublished === 'true';
  }

  const [homework, total] = await Promise.all([
    prisma.homework.findMany({
      where,
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
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.homework.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: homework.map((hw: any) => ({
      id: hw.id,
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      attachments: hw.attachments,
      instructions: hw.instructions,
      isPublished: hw.isPublished,
      class: hw.class,
      subject: hw.subject,
      submissionCount: hw._count.submissions,
      createdAt: hw.createdAt,
      updatedAt: hw.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Update Homework
export const updateHomework = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { homeworkId } = req.params;
  const schoolId = req.user!.schoolId;
  const teacherId = req.user!.userId;
  const { title, description, dueDate, attachments } = req.body;

  // Verify homework exists and belongs to the same school
  const existingHomework = await prisma.homework.findFirst({
    where: {
      id: homeworkId,
      class: { schoolId }
    }
  });

  if (!existingHomework) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Homework not found'
    });
    return;
  }

  // Check if teacher owns this homework or is admin
  if (existingHomework.teacherId !== teacherId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only edit your own homework'
    });
    return;
  }

  const updatedHomework = await prisma.homework.update({
    where: { id: homeworkId },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      attachments
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
    }
  });

  res.json({
    success: true,
    data: {
      id: updatedHomework.id,
      title: updatedHomework.title,
      description: updatedHomework.description,
      dueDate: updatedHomework.dueDate,
      attachments: updatedHomework.attachments,
      isPublished: updatedHomework.isPublished,
      class: updatedHomework.class,
      subject: updatedHomework.subject,
      teacher: updatedHomework.teacher,
      updatedAt: updatedHomework.updatedAt
    },
    message: 'Homework updated successfully'
  });
});

// Delete Homework
export const deleteHomework = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { homeworkId } = req.params;
  const schoolId = req.user!.schoolId;
  const teacherId = req.user!.userId;

  // Verify homework exists and belongs to the same school
  const existingHomework = await prisma.homework.findFirst({
    where: {
      id: homeworkId,
      class: { schoolId }
    }
  });

  if (!existingHomework) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Homework not found'
    });
    return;
  }

  // Check if teacher owns this homework or is admin
  if (existingHomework.teacherId !== teacherId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only delete your own homework'
    });
    return;
  }

  await prisma.homework.delete({
    where: { id: homeworkId }
  });

  res.json({
    success: true,
    message: 'Homework deleted successfully'
  });
});

// Publish Homework
export const publishHomework = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { homeworkId } = req.params;
  const schoolId = req.user!.schoolId;
  const teacherId = req.user!.userId;

  // Verify homework exists and belongs to the same school
  const existingHomework = await prisma.homework.findFirst({
    where: {
      id: homeworkId,
      class: { schoolId }
    }
  });

  if (!existingHomework) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Homework not found'
    });
    return;
  }

  // Check if teacher owns this homework or is admin
  if (existingHomework.teacherId !== teacherId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only publish your own homework'
    });
    return;
  }

  const updatedHomework = await prisma.homework.update({
    where: { id: homeworkId },
    data: { isPublished: true },
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
    }
  });

  res.json({
    success: true,
    data: {
      id: updatedHomework.id,
      title: updatedHomework.title,
      isPublished: updatedHomework.isPublished,
      class: updatedHomework.class,
      subject: updatedHomework.subject
    },
    message: 'Homework published successfully'
  });
});

// Get Homework Statistics
export const getHomeworkStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { teacherId, classId, startDate, endDate } = req.query;

  const where: any = {
    class: { schoolId }
  };

  if (teacherId) {
    where.teacherId = teacherId;
  }

  if (classId) {
    where.classId = classId;
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const [
    totalHomework,
    publishedHomework,
    pendingHomework,
    overdueHomework,
    totalSubmissions
  ] = await Promise.all([
    prisma.homework.count({ where }),
    prisma.homework.count({ where: { ...where, isPublished: true } }),
    prisma.homework.count({ where: { ...where, isPublished: false } }),
    prisma.homework.count({
      where: {
        ...where,
        dueDate: { lt: new Date() },
        isPublished: true
      }
    }),
    prisma.homeworkSubmission.count({
      where: {
        homework: where
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalHomework,
      publishedHomework,
      pendingHomework,
      overdueHomework,
      totalSubmissions,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
    }
  });
});
