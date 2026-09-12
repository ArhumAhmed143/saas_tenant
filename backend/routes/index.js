const auth = require('./auth/auth');
const social = require('./auth/social');
const invite = require('./auth/invite');
const platform = require('./platform/platform');
const tenants = require('./tenant/tenants');
const tenant = require('./tenant/tenant');
const users = require('./tenant/users');
const departments = require('./tenant/departments');
const projects = require('./work/projects');
const sprints = require('./work/sprints');
const tasks = require('./work/tasks');
const subtasks = require('./work/subtasks');
const epics = require('./work/epics');
const comments = require('./work/comments');
const burndown = require('./work/burndown');
const teams = require('./teams/teams');
const activities = require('./activity/activities');
const notifications = require('./activity/notifications');

module.exports = {
  auth,
  social,
  invite,
  platform,
  tenants,
  tenant,
  users,
  departments,
  projects,
  sprints,
  tasks,
  subtasks,
  epics,
  comments,
  burndown,
  teams,
  activities,
  notifications
};
