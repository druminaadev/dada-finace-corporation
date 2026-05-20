const prisma = require('../../config/database');
const AppError = require('../../utils/appError');
const fs = require('fs');
const path = require('path');

class DocumentService {
  async upload(fileData, metadata) {
    const document = await prisma.document.create({
      data: {
        entityType: metadata.entityType,
        entityId: metadata.entityId,
        documentType: metadata.documentType,
        fileName: fileData.originalname,
        filePath: fileData.path,
        fileSize: fileData.size,
        mimeType: fileData.mimetype,
      },
    });

    return document;
  }

  async getByEntity(entityType, entityId) {
    const documents = await prisma.document.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents;
  }

  async delete(id) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await prisma.document.delete({
      where: { id },
    });
  }

  async download(id) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!fs.existsSync(document.filePath)) {
      throw new AppError('File not found on server', 404);
    }

    return document;
  }
}

module.exports = new DocumentService();
