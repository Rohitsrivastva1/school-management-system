import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Create Q&A Message
export const createQAMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { studentId, message, priority } = req.body;

  // Verify student exists and belongs to the same school
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      class: { schoolId }
    },
    include: {
      class: {
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
      }
    }
  });

  if (!student) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Student not found'
    });
    return;
  }

  // Verify class teacher exists
  if (!student.class.classTeacher) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'No class teacher assigned to this student'
    });
    return;
  }

  // Determine parent and teacher IDs based on user role
  let parentId: string;
  let classTeacherId: string;

  if (userRole === 'parent') {
    parentId = userId;
    classTeacherId = student.class.classTeacher.id;
  } else if (userRole === 'class_teacher') {
    // Teacher can initiate Q&A with parent
    parentId = student.parentId || '';
    classTeacherId = userId;
  } else {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Only parents and class teachers can create Q&A messages'
    });
    return;
  }

  const qaMessage = await prisma.qAMessage.create({
    data: {
      parentId,
      classTeacherId,
      studentId,
      message,
      priority: priority || 'normal',
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
    }
  });

  res.status(201).json({
    success: true,
    data: {
      id: qaMessage.id,
      message: qaMessage.message,
      reply: qaMessage.reply,
      status: qaMessage.status,
      priority: qaMessage.priority,
      parent: qaMessage.parent,
      classTeacher: qaMessage.classTeacher,
      student: {
        id: qaMessage.student.id,
        user: qaMessage.student.user,
        class: qaMessage.student.class
      },
      createdAt: qaMessage.createdAt,
      repliedAt: qaMessage.repliedAt,
      closedAt: qaMessage.closedAt
    },
    message: 'Q&A message created successfully'
  });
});

// Get Q&A Messages
export const getQAMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { page = 1, limit = 10, status, priority, studentId } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause based on user role
  const where: any = {
    student: {
      class: { schoolId }
    }
  };

  if (userRole === 'parent') {
    where.parentId = userId;
  } else if (userRole === 'class_teacher') {
    where.classTeacherId = userId;
  }
  // Admin can see all messages

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  const [qaMessages, total] = await Promise.all([
    prisma.qAMessage.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
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
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.qAMessage.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: qaMessages.map((qa: any) => ({
      id: qa.id,
      message: qa.message,
      reply: qa.reply,
      status: qa.status,
      priority: qa.priority,
      parent: qa.parent,
      classTeacher: qa.classTeacher,
      student: {
        id: qa.student.id,
        user: qa.student.user,
        class: qa.student.class
      },
      createdAt: qa.createdAt,
      repliedAt: qa.repliedAt,
      closedAt: qa.closedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Q&A Message by ID
export const getQAMessageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { messageId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  const qaMessage = await prisma.qAMessage.findFirst({
    where: {
      id: messageId,
      student: {
        class: { schoolId }
      }
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      classTeacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
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
    }
  });

  if (!qaMessage) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Q&A message not found'
    });
    return;
  }

  // Check if user has permission to view this message
  if (userRole === 'parent' && qaMessage.parentId !== userId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only view your own Q&A messages'
    });
    return;
  }

  if (userRole === 'class_teacher' && qaMessage.classTeacherId !== userId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only view Q&A messages for your students'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: qaMessage.id,
      message: qaMessage.message,
      reply: qaMessage.reply,
      status: qaMessage.status,
      priority: qaMessage.priority,
      parent: qaMessage.parent,
      classTeacher: qaMessage.classTeacher,
      student: {
        id: qaMessage.student.id,
        user: qaMessage.student.user,
        class: qaMessage.student.class
      },
      createdAt: qaMessage.createdAt,
      repliedAt: qaMessage.repliedAt,
      closedAt: qaMessage.closedAt
    }
  });
});

// Reply to Q&A
export const replyToQA = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { messageId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { reply, status } = req.body;

  // Verify Q&A message exists and belongs to the same school
  const existingQA = await prisma.qAMessage.findFirst({
    where: {
      id: messageId,
      student: {
        class: { schoolId }
      }
    }
  });

  if (!existingQA) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Q&A message not found'
    });
    return;
  }

  // Check if user is the class teacher for this student
  if (existingQA.classTeacherId !== userId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only reply to Q&A messages for your students'
    });
    return;
  }

  const updatedQA = await prisma.qAMessage.update({
    where: { id: messageId },
    data: {
      reply,
      status: status || 'replied',
      repliedAt: new Date()
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
    }
  });

  res.json({
    success: true,
    data: {
      id: updatedQA.id,
      message: updatedQA.message,
      reply: updatedQA.reply,
      status: updatedQA.status,
      priority: updatedQA.priority,
      parent: updatedQA.parent,
      classTeacher: updatedQA.classTeacher,
      student: {
        id: updatedQA.student.id,
        user: updatedQA.student.user,
        class: updatedQA.student.class
      },
      createdAt: updatedQA.createdAt,
      repliedAt: updatedQA.repliedAt,
      closedAt: updatedQA.closedAt
    },
    message: 'Reply sent successfully'
  });
});

// Update Q&A Status
export const updateQAStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { messageId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { status } = req.body;

  // Verify Q&A message exists and belongs to the same school
  const existingQA = await prisma.qAMessage.findFirst({
    where: {
      id: messageId,
      student: {
        class: { schoolId }
      }
    }
  });

  if (!existingQA) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Q&A message not found'
    });
    return;
  }

  // Check if user is the class teacher for this student
  if (existingQA.classTeacherId !== userId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only update Q&A messages for your students'
    });
    return;
  }

  const updateData: any = { status };

  if (status === 'closed') {
    updateData.closedAt = new Date();
  }

  const updatedQA = await prisma.qAMessage.update({
    where: { id: messageId },
    data: updateData
  });

  res.json({
    success: true,
    data: {
      id: updatedQA.id,
      status: updatedQA.status,
      closedAt: updatedQA.closedAt
    },
    message: 'Q&A status updated successfully'
  });
});

// Delete Q&A Message
export const deleteQAMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { messageId } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify Q&A message exists and belongs to the same school
  const existingQA = await prisma.qAMessage.findFirst({
    where: {
      id: messageId,
      student: {
        class: { schoolId }
      }
    }
  });

  if (!existingQA) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Q&A message not found'
    });
    return;
  }

  await prisma.qAMessage.delete({
    where: { id: messageId }
  });

  res.json({
    success: true,
    message: 'Q&A message deleted successfully'
  });
});
