const en = {
  translation: {
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      logout: 'Logout',
    },
    auth: {
      userId: 'User ID',
      userKey: 'User Key',
      start: 'Start',
      loginFailed: 'Login failed. Please try again.',
    },
    roomList: {
      title: 'Conversations',
      empty: 'No conversations yet',
    },
    chat: {
      placeholder: 'Type your message…',
      online: 'Online',
      typing: '{{username}} is typing…',
      loadMore: 'Load more',
      sendFailed: 'Failed to send message',
      fileTooLarge: 'File is too large (max {{max}} MB)',
      fileUnsupported: 'File type not supported',
    },
    userList: {
      title: 'Choose Contact',
      createGroup: 'Create Group Chat',
      contact: 'Contact',
    },
    createGroup: {
      chooseMembers: 'Choose Members',
      groupName: 'Group Name',
      groupNamePlaceholder: 'Enter group name…',
      create: 'Create Group',
    },
    profile: {
      title: 'Profile',
      information: 'Information',
      displayName: 'Display Name',
      userId: 'User ID',
      editAvatar: 'Change avatar',
      logoutSuccess: 'Logged out successfully',
    },
    roomInfo: {
      title: 'Room Info',
      participants: 'Participants',
      addParticipants: 'Add Participants',
      removeParticipant: 'Remove',
    },
  },
} as const;

export default en;
