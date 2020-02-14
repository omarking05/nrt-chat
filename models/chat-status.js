// When visitor started chat, but no one from agent handle this chat
const CHAT_STATUS_UNASSIGNED  = 'unassigned';

// When visitor is communicating with agent
const CHAT_STATUS_ACTIVE      = 'active';

// When agent closed the chat, perhaps in future we'll have
// closed_by_agent
// closed_by_visitor
const CHAT_STATUS_CLOSED      = 'closed';

// When agent is not available and chat need to reassign for another available agent
const CHAT_STATUS_NEED_REASSIGN  = 'need_reassign';


module.exports = {
  CHAT_STATUS_UNASSIGNED,
  CHAT_STATUS_ACTIVE,
  CHAT_STATUS_CLOSED,
  CHAT_STATUS_NEED_REASSIGN
};