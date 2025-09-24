import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

// Upload File
export const uploadFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { type, description } = req.body;

  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'No file uploaded'
    });
    return;
  }

  const { filename, originalname, mimetype, size, path: filePath } = req.file;

  // Create file record in database
  const fileRecord = await prisma.file.create({
    data: {
      schoolId,
      uploadedBy: userId,
      fileName: originalname,
      filePath: filename,
      mimeType: mimetype,
      fileSize: size,
      fileType: type || 'general',
      description: description || null,
      isActive: true
    },
    include: {
      uploadedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });

  // Generate file URL (in production, this would be a CDN URL)
  const fileUrl = `${req.protocol}://${req.get('host')}/api/v1/files/${fileRecord.id}`;

  res.status(201).json({
    success: true,
    data: {
      id: fileRecord.id,
      fileName: fileRecord.fileName,
      fileUrl,
      fileSize: fileRecord.fileSize,
      mimeType: fileRecord.mimeType,
      fileType: fileRecord.fileType,
      description: fileRecord.description,
      uploadedAt: fileRecord.createdAt
    },
    message: 'File uploaded successfully'
  });
});

// Get File
export const getFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { fileId } = req.params;
  const schoolId = req.user!.schoolId;

  const fileRecord = await prisma.file.findFirst({
    where: {
      id: fileId,
      schoolId,
      isActive: true
    }
  });

  if (!fileRecord) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'File not found'
    });
    return;
  }

  // Check if file exists on disk
  const filePath = path.join('uploads', fileRecord.filePath);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'File not found on disk'
    });
    return;
  }

  // Set appropriate headers
  res.setHeader('Content-Type', fileRecord.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${fileRecord.fileName}"`);
  res.setHeader('Content-Length', fileRecord.fileSize);

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Delete File
export const deleteFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { fileId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;

  const fileRecord = await prisma.file.findFirst({
    where: {
      id: fileId,
      schoolId,
      isActive: true
    }
  });

  if (!fileRecord) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'File not found'
    });
    return;
  }

  // Check if user has permission to delete (uploader or admin)
  if (fileRecord.uploadedBy !== userId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'You can only delete files you uploaded'
    });
    return;
  }

  // Delete file from disk
  const filePath = path.join('uploads', fileRecord.filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Mark as inactive in database (soft delete)
  await prisma.file.update({
    where: { id: fileId },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});

// Get File Statistics
export const getFileStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { period = '30' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const [
    totalFiles,
    totalSize,
    filesByType,
    recentFiles,
    topUploaders
  ] = await Promise.all([
    // Total files
    prisma.file.count({
      where: {
        schoolId,
        isActive: true,
        createdAt: { gte: startDate }
      }
    }),
    // Total size
    prisma.file.aggregate({
      where: {
        schoolId,
        isActive: true,
        createdAt: { gte: startDate }
      },
      _sum: { fileSize: true }
    }),
    // Files by type
    prisma.file.groupBy({
      by: ['fileType'],
      where: {
        schoolId,
        isActive: true,
        createdAt: { gte: startDate }
      },
      _count: { fileType: true },
      _sum: { fileSize: true }
    }),
    // Recent files
    prisma.file.findMany({
      where: {
        schoolId,
        isActive: true,
        createdAt: { gte: startDate }
      },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    // Top uploaders
    prisma.file.groupBy({
      by: ['uploadedBy'],
      where: {
        schoolId,
        isActive: true,
        createdAt: { gte: startDate }
      },
      _count: { uploadedBy: true },
      _sum: { fileSize: true },
      orderBy: { _count: { uploadedBy: 'desc' } },
      take: 5
    })
  ]);

  // Get user details for top uploaders
  const topUploadersWithDetails = await Promise.all(
    (topUploaders as any[]).map(async (uploader: any) => {
      const user = await prisma.user.findUnique({
        where: { id: uploader.uploadedBy },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      });
      return {
        user,
        fileCount: uploader._count.uploadedBy,
        totalSize: uploader._sum.fileSize || 0
      };
    })
  );

  res.json({
    success: true,
    data: {
      overview: {
        totalFiles,
        totalSize: totalSize._sum.fileSize || 0,
        averageFileSize: totalFiles > 0 ? Math.round((totalSize._sum.fileSize || 0) / totalFiles) : 0
      },
      byType: (filesByType as any[]).map((item: any) => ({
        type: item.fileType,
        count: item._count.fileType,
        totalSize: item._sum.fileSize || 0
      })),
      recentFiles: (recentFiles as any[]).map((file: any) => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadedBy: file.uploadedByUser,
        createdAt: file.createdAt
      })),
      topUploaders: topUploadersWithDetails
    }
  });
});
