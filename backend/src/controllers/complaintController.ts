import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Create Complaint
export const createComplaint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { studentId, subject, description, category, priority } = req.body;

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

  // Determine complainant and class teacher
  let complainantId: string;
  let classTeacherId: string | null = null;

  if (userRole === 'parent') {
    complainantId = userId;
    classTeacherId = student.class.classTeacher?.id || null;
  } else if (userRole === 'student') {
    complainantId = userId;
    classTeacherId = student.class.classTeacher?.id || null;
  } else if (userRole === 'admin') {
    complainantId = userId;
    classTeacherId = student.class.classTeacher?.id || null;
  } else {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Only parents, students, and admins can file complaints'
    });
    return;
  }

  const complaint = await prisma.complaint.create({
    data: {
      studentId,
      complainantId,
      classTeacherId,
      subject,
      description,
      category: category || 'other',
      priority: priority || 'normal',
      status: 'open'
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
      complainant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
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
      resolver: {
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
    data: {
      id: complaint.id,
      subject: complaint.subject,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      resolution: complaint.resolution,
      student: {
        id: complaint.student.id,
        user: complaint.student.user,
        class: complaint.student.class
      },
      complainant: complaint.complainant,
      classTeacher: complaint.classTeacher,
      resolvedBy: complaint.resolver,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt,
      closedAt: complaint.closedAt
    },
    message: 'Complaint filed successfully'
  });
});

// Get Complaints
export const getComplaints = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { page = 1, limit = 10, status, category, priority, studentId } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause based on user role
  const where: any = {
    student: {
      class: { schoolId }
    }
  };

  if (userRole === 'parent') {
    where.complainantId = userId;
  } else if (userRole === 'class_teacher') {
    where.classTeacherId = userId;
  }
  // Admin can see all complaints

  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (priority) {
    where.priority = priority;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
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
        complainant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
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
        resolver: {
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
      orderBy: { createdAt: 'desc' }
    }),
    prisma.complaint.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: complaints.map((complaint: any) => ({
      id: complaint.id,
      subject: complaint.subject,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      resolution: complaint.resolution,
      student: {
        id: complaint.student.id,
        user: complaint.student.user,
        class: complaint.student.class
      },
      complainant: complaint.complainant,
      classTeacher: complaint.classTeacher,
      resolvedBy: complaint.resolver,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt,
      closedAt: complaint.closedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Complaint by ID
export const getComplaintById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { complaintId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  const complaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      student: {
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
      complainant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true
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
      resolver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!complaint) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Complaint not found'
    });
    return;
  }

  // Check if user has permission to view this complaint
  if (userRole === 'parent' && complaint.complainantId !== userId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only view your own complaints'
    });
    return;
  }

  if (userRole === 'class_teacher' && complaint.classTeacherId !== userId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only view complaints for your students'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: complaint.id,
      subject: complaint.subject,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      resolution: complaint.resolution,
      student: {
        id: complaint.student.id,
        user: complaint.student.user,
        class: complaint.student.class
      },
      complainant: complaint.complainant,
      classTeacher: complaint.classTeacher,
      resolvedBy: complaint.resolver,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt,
      closedAt: complaint.closedAt
    }
  });
});

// Update Complaint
export const updateComplaint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { complaintId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { subject, description, category, priority, status } = req.body;

  // Verify complaint exists and belongs to the same school
  const existingComplaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      student: {
        class: { schoolId }
      }
    }
  });

  if (!existingComplaint) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Complaint not found'
    });
    return;
  }

  // Check if user has permission to update this complaint
  if (existingComplaint.classTeacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only update complaints for your students'
    });
    return;
  }

  const updatedComplaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      subject,
      description,
      category,
      priority,
      status
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
      complainant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      },
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
    data: {
      id: updatedComplaint.id,
      subject: updatedComplaint.subject,
      description: updatedComplaint.description,
      category: updatedComplaint.category,
      priority: updatedComplaint.priority,
      status: updatedComplaint.status,
      resolution: updatedComplaint.resolution,
      student: {
        id: updatedComplaint.student.id,
        user: updatedComplaint.student.user,
        class: updatedComplaint.student.class
      },
      complainant: updatedComplaint.complainant,
      classTeacher: updatedComplaint.classTeacher,
      createdAt: updatedComplaint.createdAt,
      resolvedAt: updatedComplaint.resolvedAt,
      closedAt: updatedComplaint.closedAt
    },
    message: 'Complaint updated successfully'
  });
});

// Resolve Complaint
export const resolveComplaint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { complaintId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { resolution, status } = req.body;

  // Verify complaint exists and belongs to the same school
  const existingComplaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      student: {
        class: { schoolId }
      }
    }
  });

  if (!existingComplaint) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Complaint not found'
    });
    return;
  }

  // Check if user has permission to resolve this complaint
  if (existingComplaint.classTeacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only resolve complaints for your students'
    });
    return;
  }

  const updateData: any = {
    resolution,
    status: status || 'resolved',
    resolvedBy: userId,
    resolvedAt: new Date()
  };

  if (status === 'closed') {
    updateData.closedAt = new Date();
  }

  const resolvedComplaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: updateData,
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
      complainant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
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
      resolver: {
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
    data: {
      id: resolvedComplaint.id,
      subject: resolvedComplaint.subject,
      description: resolvedComplaint.description,
      category: resolvedComplaint.category,
      priority: resolvedComplaint.priority,
      status: resolvedComplaint.status,
      resolution: resolvedComplaint.resolution,
      student: {
        id: resolvedComplaint.student.id,
        user: resolvedComplaint.student.user,
        class: resolvedComplaint.student.class
      },
      complainant: resolvedComplaint.complainant,
      classTeacher: resolvedComplaint.classTeacher,
      resolvedBy: resolvedComplaint.resolvedBy,
      createdAt: resolvedComplaint.createdAt,
      resolvedAt: resolvedComplaint.resolvedAt,
      closedAt: resolvedComplaint.closedAt
    },
    message: 'Complaint resolved successfully'
  });
});

// Delete Complaint
export const deleteComplaint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { complaintId } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify complaint exists and belongs to the same school
  const existingComplaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      student: {
        class: { schoolId }
      }
    }
  });

  if (!existingComplaint) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Complaint not found'
    });
    return;
  }

  await prisma.complaint.delete({
    where: { id: complaintId }
  });

  res.json({
    success: true,
    message: 'Complaint deleted successfully'
  });
});
