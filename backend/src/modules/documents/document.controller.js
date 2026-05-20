const documentService = require('./document.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const AppError = require('../../utils/appError');

class DocumentController {
  upload = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { entityType, entityId, documentType } = req.body;

    if (!entityType || !entityId || !documentType) {
      throw new AppError('entityType, entityId, and documentType are required', 400);
    }

    const document = await documentService.upload(req.file, {
      entityType,
      entityId,
      documentType,
    });

    ApiResponse.success(res, document, 'Document uploaded successfully', 201);
  });

  getByEntity = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    const documents = await documentService.getByEntity(entityType, entityId);
    ApiResponse.success(res, documents, 'Documents fetched successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await documentService.delete(req.params.id);
    ApiResponse.success(res, null, 'Document deleted successfully');
  });

  download = asyncHandler(async (req, res) => {
    const document = await documentService.download(req.params.id);
    res.download(document.filePath, document.fileName);
  });
}

module.exports = new DocumentController();
