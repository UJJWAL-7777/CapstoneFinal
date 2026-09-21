import { Router } from 'express';
import * as caseController from '../controllers/case.controller.js';
import * as caseWorkspaceController from '../controllers/caseWorkspace.controller.js';
import * as documentController from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Case CRUD
router.get('/documents/all', documentController.getAllMyDocuments);
router.get('/documents/:docId/download', documentController.downloadDocument);
router.post('/', authorize(ROLES.ADVOCATE), caseController.createCase);
router.get('/', caseController.getCases);
router.get('/:id', caseController.getCase);
router.put('/:id', caseController.updateCase);

// Documents
router.post('/:caseId/documents', documentController.upload.single('file'), documentController.uploadDocument);
router.get('/:caseId/documents', documentController.getDocuments);
router.delete('/:caseId/documents/:docId', documentController.deleteDocument);
router.put('/:caseId/documents/:docId/review', authorize(ROLES.ADVOCATE), documentController.reviewDocument);

// Document requests
router.post('/:caseId/document-requests', authorize(ROLES.ADVOCATE), documentController.createDocumentRequest);
router.get('/:caseId/document-requests', documentController.getDocumentRequests);

// Tasks
router.post('/:caseId/tasks', authorize(ROLES.ADVOCATE), caseWorkspaceController.createTask);
router.get('/:caseId/tasks', caseWorkspaceController.getTasks);
router.put('/:caseId/tasks/:taskId', caseWorkspaceController.updateTask);
router.delete('/:caseId/tasks/:taskId', authorize(ROLES.ADVOCATE), caseWorkspaceController.deleteTask);

// Timeline
router.get('/:caseId/timeline', caseWorkspaceController.getTimeline);
router.post('/:caseId/timeline', authorize(ROLES.ADVOCATE), caseWorkspaceController.addTimelineEvent);

// Hearings
router.post('/:caseId/hearings', authorize(ROLES.ADVOCATE), caseWorkspaceController.createHearing);
router.get('/:caseId/hearings', caseWorkspaceController.getHearings);
router.put('/:caseId/hearings/:hearingId', authorize(ROLES.ADVOCATE), caseWorkspaceController.updateHearing);

// Notes (advocate only)
router.post('/:caseId/notes', authorize(ROLES.ADVOCATE), caseWorkspaceController.createNote);
router.get('/:caseId/notes', authorize(ROLES.ADVOCATE), caseWorkspaceController.getNotes);
router.put('/:caseId/notes/:noteId', authorize(ROLES.ADVOCATE), caseWorkspaceController.updateNote);
router.delete('/:caseId/notes/:noteId', authorize(ROLES.ADVOCATE), caseWorkspaceController.deleteNote);

export default router;
