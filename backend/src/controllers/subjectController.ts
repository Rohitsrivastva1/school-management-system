import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Get Subjects
export const getSubjects = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 50, search, isActive } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = { schoolId };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' }
    }),
    prisma.subject.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: subjects,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Subject by ID
export const getSubjectById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  const subject = await prisma.subject.findFirst({
    where: {
      id,
      schoolId
    }
  });

  if (!subject) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Subject not found'
    });
    return;
  }

  res.json({
    success: true,
    data: subject
  });
});

// Create Subject
export const createSubject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { name, code, description, isCore } = req.body;

  // Check if subject with same name already exists
  const existingSubject = await prisma.subject.findFirst({
    where: { name, schoolId }
  });

  if (existingSubject) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'Subject with this name already exists'
    });
    return;
  }

  const newSubject = await prisma.subject.create({
    data: {
      schoolId,
      name,
      code,
      description,
      isCore: isCore ?? true
    }
  });

  res.status(201).json({
    success: true,
    data: newSubject,
    message: 'Subject created successfully'
  });
});

// Update Subject
export const updateSubject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;
  const updateData = req.body;

  // Verify subject exists and belongs to the same school
  const existingSubject = await prisma.subject.findFirst({
    where: { id, schoolId }
  });

  if (!existingSubject) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Subject not found'
    });
    return;
  }

  // Check if new name conflicts with existing subject
  if (updateData.name && updateData.name !== existingSubject.name) {
    const nameConflict = await prisma.subject.findFirst({
      where: { 
        name: updateData.name, 
        schoolId,
        id: { not: id }
      }
    });

    if (nameConflict) {
      res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Subject with this name already exists'
      });
      return;
    }
  }

  const updatedSubject = await prisma.subject.update({
    where: { id },
    data: {
      name: updateData.name,
      code: updateData.code,
      description: updateData.description,
      isCore: updateData.isCore,
      isActive: updateData.isActive
    }
  });

  res.json({
    success: true,
    data: updatedSubject,
    message: 'Subject updated successfully'
  });
});

// Delete Subject
export const deleteSubject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify subject exists and belongs to the same school
  const subject = await prisma.subject.findFirst({
    where: { id, schoolId }
  });

  if (!subject) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Subject not found'
    });
    return;
  }

  // Soft delete by setting isActive to false
  await prisma.subject.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Subject deactivated successfully'
  });
});
