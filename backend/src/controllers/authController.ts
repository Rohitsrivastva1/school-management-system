import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateTokens, generateAccessToken } from '../utils/jwt';
import { UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

// School Registration
export const registerSchool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, address, city, state, pincode, phone, website } = req.body;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Password does not meet requirements',
      details: passwordValidation.errors.map(error => ({ field: 'password', message: error }))
    });
    return;
  }

  // Check if school already exists
  const existingSchool = await prisma.school.findUnique({
    where: { email }
  });

  if (existingSchool) {
    res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'School with this email already exists'
    });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate school domain
  const domain = `${name.toLowerCase().replace(/\s+/g, '')}.schoolmanagement.com`;

  // Create school and admin user in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create school
    const school = await tx.school.create({
      data: {
        name,
        email,
        address,
        city,
        state,
        pincode,
        phone,
        website,
        domain
      }
    });

    // Create admin user
    const admin = await tx.user.create({
      data: {
        schoolId: school.id,
        email,
        passwordHash,
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: name,
        emailVerified: true
      }
    });

    return { school, admin };
  });

  // Generate tokens
  const tokens = generateTokens({
    userId: result.admin.id,
    schoolId: result.school.id,
    role: UserRole.ADMIN,
    email: result.admin.email
  });

  res.status(201).json({
    success: true,
    data: {
      school: {
        id: result.school.id,
        name: result.school.name,
        domain: result.school.domain,
        isActive: result.school.isActive
      },
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        role: result.admin.role
      },
      tokens
    },
    message: 'School registered successfully'
  });
});

// User Login
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user with school data
  const user = await prisma.user.findFirst({
    where: { 
      email,
      isActive: true
    },
    include: {
      school: true
    }
  });

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid email or password'
    });
  }

  // Check if school is active
  if (!user?.school?.isActive) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'School account is deactivated'
    });
    return;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid email or password'
    });
    return;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user!.id },
    data: { lastLogin: new Date() }
  });

  // Generate tokens
  const tokens = generateTokens({
    userId: user!.id,
    schoolId: user!.schoolId,
    role: user!.role as UserRole,
    email: user!.email
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
        schoolId: user!.schoolId,
        firstName: user!.firstName,
        lastName: user!.lastName,
        profileImageUrl: user!.profileImageUrl
      },
      tokens
    },
    message: 'Login successful'
  });
});

// Refresh Token
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const { verifyRefreshToken } = await import('../utils/jwt');
    const { userId, schoolId } = verifyRefreshToken(refreshToken);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true }
    });

    if (!user || !user.isActive || !user.school.isActive) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid refresh token'
      });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      schoolId: user.schoolId,
      role: user.role as UserRole,
      email: user.email
    });

    res.json({
      success: true,
      data: {
        accessToken
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired refresh token'
    });
  }
});

// Logout
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // In a more sophisticated implementation, you would:
  // 1. Add the token to a blacklist
  // 2. Remove the session from database
  // 3. Invalidate refresh token
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Get Current User Profile
export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          domain: true,
          logoUrl: true
        }
      },
      student: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              section: true
            }
          }
        }
      },
      teacher: {
        select: {
          employeeId: true,
          subjects: true,
          isClassTeacher: true
        }
      }
    }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'User not found'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      school: user.school,
      student: user.student,
      teacher: user.teacher
    }
  });
});

// Update Profile
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { firstName, lastName, phone, profileImageUrl } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone,
      profileImageUrl
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileImageUrl: true
    }
  });

  res.json({
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  });
});

// Change Password
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'User not found'
    });
    return;
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'Current password is incorrect'
    });
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'New password does not meet requirements',
      details: passwordValidation.errors.map(error => ({ field: 'newPassword', message: error }))
    });
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
