import type { Card, Column, User, Label, Sprint } from '../types'

export const COLUMNS: Column[] = [
  { id: 'col-backlog',  title: 'Backlog',     order: 0 },
  { id: 'col-inprog',  title: 'In Progress',  order: 1 },
  { id: 'col-review',  title: 'Review',       order: 2 },
  { id: 'col-done',    title: 'Done',         order: 3 },
]

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Chen' },
  { id: 'u2', name: 'Bob Martinez' },
  { id: 'u3', name: 'Carol Johnson' },
  { id: 'u4', name: 'Dave Kim' },
]

export const LABELS: Label[] = [
  { id: 'l1', name: 'bug',     color: '#ef4444' },
  { id: 'l2', name: 'feature', color: '#3b82f6' },
  { id: 'l3', name: 'docs',    color: '#6b7280' },
]

export const SPRINTS: Sprint[] = [
  { id: 's1', name: 'Sprint 1', active: false, startDate: '2024-04-01', endDate: '2024-04-14' },
  { id: 's2', name: 'Sprint 2', active: true,  startDate: '2024-04-15', endDate: '2024-04-28' },
]

export const CARDS: Card[] = [
  { id: 'c1',  title: 'Fix login page styles',       description: 'Button alignment broken on mobile', columnId: 'col-backlog', assigneeId: 'u1', labelIds: ['l1'], dueDate: '2024-04-20', priority: 'high',   sprintId: 's2', createdAt: '2024-04-15', order: 0 },
  { id: 'c2',  title: 'Add dark mode toggle',        description: 'User preference persisted in localStorage', columnId: 'col-backlog', assigneeId: 'u2', labelIds: ['l2'], dueDate: '2024-04-25', priority: 'medium', sprintId: 's2', createdAt: '2024-04-15', order: 1 },
  { id: 'c3',  title: 'Update API documentation',    description: 'Document new /search endpoint', columnId: 'col-backlog', assigneeId: null, labelIds: ['l3'], dueDate: null, priority: 'low', sprintId: 's1', createdAt: '2024-04-01', order: 2 },
  { id: 'c4',  title: 'Implement search feature',    description: 'Full-text search across card titles and descriptions', columnId: 'col-inprog', assigneeId: 'u3', labelIds: ['l2'], dueDate: '2024-04-22', priority: 'high',   sprintId: 's2', createdAt: '2024-04-16', order: 0 },
  { id: 'c5',  title: 'Fix WebSocket reconnection',  description: 'Clients do not reconnect after network drop', columnId: 'col-inprog', assigneeId: 'u1', labelIds: ['l1'], dueDate: '2024-04-21', priority: 'high',   sprintId: 's2', createdAt: '2024-04-16', order: 1 },
  { id: 'c6',  title: 'Drag-drop performance audit', description: 'Profile and reduce lag on large boards', columnId: 'col-inprog', assigneeId: 'u4', labelIds: ['l2','l1'], dueDate: '2024-04-24', priority: 'medium', sprintId: 's2', createdAt: '2024-04-17', order: 2 },
  { id: 'c7',  title: 'Sprint planning UI',          description: 'Allow assigning cards to sprints from board view', columnId: 'col-review', assigneeId: 'u2', labelIds: ['l2'], dueDate: '2024-04-18', priority: 'medium', sprintId: 's2', createdAt: '2024-04-14', order: 0 },
  { id: 'c8',  title: 'Label management screen',     description: 'CRUD interface for labels', columnId: 'col-review', assigneeId: 'u3', labelIds: ['l2'], dueDate: '2024-04-19', priority: 'low',    sprintId: 's2', createdAt: '2024-04-14', order: 1 },
  { id: 'c9',  title: 'Setup CI pipeline',           description: 'GitHub Actions: lint, test, build', columnId: 'col-done', assigneeId: 'u4', labelIds: ['l2','l3'], dueDate: '2024-04-10', priority: 'high',   sprintId: 's1', createdAt: '2024-04-01', order: 0 },
  { id: 'c10', title: 'Write onboarding docs',       description: 'Getting started guide for new engineers', columnId: 'col-done', assigneeId: 'u1', labelIds: ['l3'], dueDate: '2024-04-12', priority: 'medium', sprintId: 's1', createdAt: '2024-04-02', order: 1 },
  { id: 'c11', title: 'Undo/redo implementation',    description: 'Ctrl+Z should undo the last card action', columnId: 'col-done', assigneeId: 'u2', labelIds: ['l2'], dueDate: '2024-04-13', priority: 'medium', sprintId: 's1', createdAt: '2024-04-03', order: 2 },
  { id: 'c12', title: 'Board statistics widget',     description: 'Show completion percentage in header', columnId: 'col-done', assigneeId: 'u3', labelIds: ['l2'], dueDate: '2024-04-11', priority: 'low',    sprintId: 's1', createdAt: '2024-04-04', order: 3 },
]
