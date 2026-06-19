# Document Upload Guide

## How to Upload Documents

### In Loan Application (5-Stage Flow)

**Stage 4: Document Upload**

1. Navigate to Stage 4 after completing Stages 1-3
2. You'll see different document categories:
   - **Customer Documents** (Required: Identity Proof, PAN Card, Passport Photo, Address Proof)
   - **Nominee Documents** (Optional)
   - **Guarantor Documents** (Required: Identity Proof, PAN Card, Address Proof)
   - **Vehicle Documents** (Only for Vehicle Loans)

3. **To Upload a Document:**
   - Click on the upload area (large box with upload icon)
   - OR drag and drop a file onto the upload area
   - Supported formats: PDF, JPG, PNG, GIF
   - Maximum file size: 5MB

4. **After Upload:**
   - You'll see a green checkmark with the file name
   - File size will be displayed
   - Click the X button to remove the file
   - Click "Add Another File" to upload multiple files for the same category

5. **Navigation:**
   - Click "Previous" to go back to Stage 3
   - Click "Skip for Now" to proceed without uploading all documents
   - Click "Next: Review & Submit" to proceed (required documents must be uploaded)

6. **Upload Summary:**
   - At the bottom, you'll see a summary showing the count of uploaded documents in each category

### In Add Loan (Quick Flow)

**Step 4: Document Upload**

1. After completing Steps 1-3, you'll reach the document upload step
2. Click on any document box to select and upload a file
3. The upload area will highlight on hover
4. After selecting a file, you'll see a success message
5. Click "Save & Continue" to proceed to the final review

## Troubleshooting

### Upload Not Working?

1. **Check File Size:** Files must be under 5MB
2. **Check File Type:** Only PDF, JPG, PNG, and GIF are supported
3. **Clear Browser Cache:** Sometimes cached data can cause issues
4. **Check LocalStorage:** If you see a storage warning, click "Clear Storage"

### File Not Showing After Upload?

- The system stores only file metadata (name and size) to avoid localStorage quota issues
- In production, files would be uploaded to a server
- In frontend-only mode, files are simulated

### Required Documents Missing Error?

Make sure you've uploaded:
- Customer: Identity Proof, PAN Card, Passport Photo, Address Proof
- Guarantor: Identity Proof, PAN Card, Address Proof

### Skip Documents?

- You can click "Skip for Now" to proceed without uploading all documents
- This is useful for testing or when documents will be uploaded later
- Note: In production, required documents should be enforced

## Features

✅ **Drag and Drop:** Drag files directly onto the upload area
✅ **Click to Upload:** Click the upload area to browse files
✅ **File Validation:** Automatic validation of file type and size
✅ **Visual Feedback:** Clear indication of uploaded files
✅ **Multiple Files:** Upload multiple files per category
✅ **Easy Removal:** Remove uploaded files with one click
✅ **Upload Summary:** See total uploaded documents at a glance
