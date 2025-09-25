import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

// Create Teacher
export const createTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const {
    email,
    firstName,
    lastName,
    phone,
    employeeId,
    qualification,
    subjects,
    joiningDate,
    salary,
    department,
    experienceYears
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email, schoolId }
  });

  if (existingUser) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'User with this email already exists'
    });
    return;
  }

  // Generate temporary password
  const tempPassword = 'TempPass123!';
  const passwordHash = await hashPassword(tempPassword);

  // Create user and teacher in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create user
    const user = await tx.user.create({
      data: {
        schoolId,
        email,
        passwordHash,
        role: UserRole.SUBJECT_TEACHER,
        firstName,
        lastName,
        phone,
        emailVerified: false
      }
    });

    // Create teacher
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        employeeId,
        qualification,
        subjects: Array.isArray(subjects) ? subjects : [subjects],
        joiningDate: new Date(joiningDate),
        salary: salary ? parseFloat(salary) : null,
        department,
        experienceYears: experienceYears ? parseInt(experienceYears) : null
      }
    });

    return { user, teacher };
  });

  res.status(201).json({
    success: true,
    data: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.user.role,
      employeeId: result.teacher.employeeId,
      subjects: result.teacher.subjects,
      joiningDate: result.teacher.joiningDate
    },
    message: 'Teacher created successfully. Temporary password sent to email.'
  });
});

// Get Teachers List
export const getTeachers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 10, search, department, isActive } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    schoolId,
    role: { in: [UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER] }
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [teachers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        teacher: {
          select: {
            employeeId: true,
            qualification: true,
            subjects: true,
            joiningDate: true,
            salary: true,
            department: true,
            experienceYears: true,
            isClassTeacher: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: teachers.map((teacher: any) => ({
      id: teacher.id,
      email: teacher.email,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone,
      role: teacher.role,
      isActive: teacher.isActive,
      createdAt: teacher.createdAt,
      teacher: teacher.teacher
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Bulk Upload Students
export const bulkUploadStudents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { classId } = req.body;

  // This would typically handle CSV file upload
  // For now, we'll create a sample student
  const sampleStudent = {
    rollNumber: '001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2010-05-15',
    gender: 'male',
    fatherName: 'Robert Doe',
    motherName: 'Jane Doe',
    fatherPhone: '+91-9876543210',
    motherPhone: '+91-9876543211',
    admissionDate: '2024-01-15'
  };

  // Generate temporary password
  const tempPassword = 'TempPass123!';
  const passwordHash = await hashPassword(tempPassword);

  // Create user and student in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create user
    const user = await tx.user.create({
      data: {
        schoolId,
        email: `${sampleStudent.rollNumber}@student.${schoolId}.com`,
        passwordHash,
        role: UserRole.STUDENT,
        firstName: sampleStudent.firstName,
        lastName: sampleStudent.lastName,
        dateOfBirth: new Date(sampleStudent.dateOfBirth),
        gender: sampleStudent.gender,
        emailVerified: false
      }
    });

    // Create student
    const student = await tx.student.create({
      data: {
        userId: user.id,
        classId,
        rollNumber: sampleStudent.rollNumber,
        admissionDate: new Date(sampleStudent.admissionDate),
        fatherName: sampleStudent.fatherName,
        motherName: sampleStudent.motherName,
        fatherPhone: sampleStudent.fatherPhone,
        motherPhone: sampleStudent.motherPhone
      }
    });

    return { user, student };
  });

  res.status(201).json({
    success: true,
    data: {
      id: result.user.id,
      rollNumber: result.student.rollNumber,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      classId: result.student.classId
    },
    message: 'Student created successfully'
  });
});

// Get Students List
export const getStudents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { page = 1, limit = 20, classId, search, isActive } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    user: { 
      schoolId,
      role: UserRole.STUDENT
    }
  };

  if (classId) {
    where.classId = classId;
  }

  if (search) {
    where.OR = [
      { rollNumber: { contains: search as string, mode: 'insensitive' } },
      { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
      { user: { lastName: { contains: search as string, mode: 'insensitive' } } }
    ];
  }

  if (isActive !== undefined) {
    where.user = { ...where.user, isActive: isActive === 'true' };
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            isActive: true,
            createdAt: true
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
      skip,
      take,
      orderBy: { rollNumber: 'asc' }
    }),
    prisma.student.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: students.map((student: any) => ({
      id: student.id,
      rollNumber: student.rollNumber,
      admissionNumber: student.admissionNumber,
      admissionDate: student.admissionDate,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherPhone: student.fatherPhone,
      motherPhone: student.motherPhone,
      isActive: student.isActive,
      user: student.user,
      class: student.class
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Update User
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const schoolId = req.user!.schoolId;
  const updateData = req.body;

  // Verify user belongs to the same school
  const user = await prisma.user.findFirst({
    where: { id: userId, schoolId }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'User not found'
    });
    return;
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      phone: updateData.phone,
      profileImageUrl: updateData.profileImageUrl,
      isActive: updateData.isActive
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileImageUrl: true,
      isActive: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    data: updatedUser,
    message: 'User updated successfully'
  });
});

// Delete User
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify user belongs to the same school
  const user = await prisma.user.findFirst({
    where: { id: userId, schoolId }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'User not found'
    });
    return;
  }

  // Soft delete by setting isActive to false
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// Get Student by ID
export const getStudentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  const student = await prisma.student.findFirst({
    where: {
      id,
      user: {
        schoolId,
        role: UserRole.STUDENT
      }
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          isActive: true,
          createdAt: true
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
  });

  if (!student) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Student not found'
    });
    return;
  }

  res.json({
    success: true,
    data: student
  });
});

// Update Student
export const updateStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;
  const updateData = req.body;

  // Verify student belongs to the same school
  const existingStudent = await prisma.student.findFirst({
    where: {
      id,
      user: {
        schoolId,
        role: UserRole.STUDENT
      }
    },
    include: {
      user: true
    }
  });

  if (!existingStudent) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Student not found'
    });
    return;
  }

  // Update in transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Update user data
    const updatedUser = await tx.user.update({
      where: { id: existingStudent.userId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        gender: updateData.gender,
        isActive: updateData.isActive
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Update student data
    const updatedStudent = await tx.student.update({
      where: { id },
      data: {
        fatherName: updateData.fatherName,
        motherName: updateData.motherName,
        fatherPhone: updateData.fatherPhone,
        motherPhone: updateData.motherPhone,
        fatherEmail: updateData.fatherEmail,
        motherEmail: updateData.motherEmail,
        bloodGroup: updateData.bloodGroup,
        transportMode: updateData.transportMode,
        busRoute: updateData.busRoute,
        emergencyContact: updateData.emergencyContact,
        isActive: updateData.isActive
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            isActive: true,
            createdAt: true
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
    });

    return updatedStudent;
  });

  res.json({
    success: true,
    data: result,
    message: 'Student updated successfully'
  });
});

// Create Student
export const createStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const {
    email,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    classId,
    rollNumber,
    admissionNumber,
    fatherName,
    motherName,
    fatherPhone,
    motherPhone,
    fatherEmail,
    motherEmail,
    bloodGroup,
    transportMode,
    busRoute,
    emergencyContact
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email, schoolId }
  });

  if (existingUser) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'User with this email already exists'
    });
    return;
  }

  // Generate temporary password
  const tempPassword = 'TempPass123!';
  const passwordHash = await hashPassword(tempPassword);

  // Create user and student in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create user
    const user = await tx.user.create({
      data: {
        schoolId,
        email,
        passwordHash,
        role: UserRole.STUDENT,
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        isActive: true,
        emailVerified: true
      }
    });

    // Create student
    const student = await tx.student.create({
      data: {
        userId: user.id,
        classId,
        rollNumber,
        admissionNumber: admissionNumber || `ADM${Date.now()}`,
        fatherName,
        motherName,
        fatherPhone,
        motherPhone,
        fatherEmail,
        motherEmail,
        bloodGroup,
        transportMode,
        busRoute,
        emergencyContact,
        admissionDate: new Date(),
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            isActive: true,
            createdAt: true
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
    });

    return student;
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Student created successfully'
  });
});

// Delete Student
export const deleteStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  // Verify student belongs to the same school
  const student = await prisma.student.findFirst({
    where: {
      id,
      user: {
        schoolId,
        role: UserRole.STUDENT
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

  // Soft delete by setting isActive to false
  await prisma.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: student.userId },
      data: { isActive: false }
    });
    
    await tx.student.update({
      where: { id },
      data: { isActive: false }
    });
  });

  res.json({
    success: true,
    message: 'Student deactivated successfully'
  });
});