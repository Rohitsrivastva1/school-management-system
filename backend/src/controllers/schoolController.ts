import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Get School Profile
export const getSchoolProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pincode: true,
      phone: true,
      email: true,
      website: true,
      logoUrl: true,
      domain: true,
      academicYearStart: true,
      academicYearEnd: true,
      timezone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!school) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'School not found'
    });
  }

  res.json({
    success: true,
    data: school
  });
});

// Update School Profile
export const updateSchoolProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { name, address, city, state, pincode, phone, website, logoUrl } = req.body;

  const updatedSchool = await prisma.school.update({
    where: { id: schoolId },
    data: {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      website,
      logoUrl
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pincode: true,
      phone: true,
      email: true,
      website: true,
      logoUrl: true,
      domain: true,
      academicYearStart: true,
      academicYearEnd: true,
      timezone: true,
      isActive: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    data: updatedSchool,
    message: 'School profile updated successfully'
  });
});

// Get School Statistics
export const getSchoolStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    activeClasses,
    recentAdmissions
  ] = await Promise.all([
    prisma.student.count({
      where: { 
        user: { schoolId },
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
    prisma.class.count({
      where: { 
        schoolId,
        isActive: true 
      }
    }),
    prisma.student.count({
      where: {
        user: { schoolId },
        admissionDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalClasses,
      activeClasses,
      recentAdmissions
    }
  });
});
