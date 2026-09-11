export const environment = {
  production: false,
  apiUrl: 'http://localhost:8084',
};


// SELECT * FROM information_schema.check_constraints 
// WHERE constraint_name = 'history_action_actiontype_check';

// ALTER TABLE history_action 
// DROP CONSTRAINT history_action_actiontype_check;

// ALTER TABLE history_action 
// ADD CONSTRAINT history_action_actiontype_check 
// CHECK (actionType IN ('add', 'modify', 'delete', 'approve', 'reject'));