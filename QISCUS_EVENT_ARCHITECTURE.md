# Qiscus Event Architecture

## 🎯 How Qiscus SDK Events Work

### The Correct Pattern

Qiscus SDK **does NOT** have an `.events.on()` API. Instead, it uses **callbacks in the init options**.

## 📐 Architecture Overview

```
Qiscus SDK Callbacks → EventEmitter Bridge → React Components
```

### 1. Qiscus SDK (Source)
The SDK fires callbacks when events occur:
```javascript
qiscus.init({
  AppId: 'sdksample',
  options: {
    newMessagesCallback(messages) {
      // Called when new messages arrive
    },
    commentReadCallback(data) {
      // Called when messages are read
    },
    // ... other callbacks
  }
});
```

### 2. EventEmitter Bridge (Middle Layer)
We bridge these callbacks to an EventEmitter so components can subscribe:

```javascript
// app/qiscus/index.js
import EventEmitter from 'eventemitter3';

export const qiscusEvents = new EventEmitter();

export function init() {
  qiscus.init({
    AppId: appId,
    options: {
      newMessagesCallback(messages) {
        console.log('New messages:', messages);
        qiscusEvents.emit('new-messages', messages); // ← Bridge to EventEmitter
      },
      commentReadCallback(data) {
        qiscusEvents.emit('comment-read', data);
      },
      // ... etc
    },
  });
}
```

### 3. React Components (Consumers)
Components listen to the EventEmitter:

```javascript
import {qiscusEvents} from 'qiscus';

class ChatScreen extends React.Component {
  componentDidMount() {
    // Subscribe to events
    this.newMessageListener = qiscusEvents.on('new-messages', (messages) => {
      messages.forEach((message) => this.handleNewMessage(message));
    });
  }
  
  componentWillUnmount() {
    // Clean up
    qiscusEvents.off('new-messages', this.newMessageListener);
  }
}
```

## 📋 Available Events

All events are bridged from Qiscus SDK callbacks:

| Event Name | Qiscus Callback | Data |
|------------|----------------|------|
| `login-success` | `loginSuccessCallback` | `authData` |
| `new-messages` | `newMessagesCallback` | `messages[]` |
| `presence` | `presenceCallback` | `{isOnline, lastOnline}` |
| `comment-read` | `commentReadCallback` | `data` |
| `comment-delivered` | `commentDeliveredCallback` | `data` |
| `typing` | `typingCallback` | `data` |
| `chat-room-created` | `chatRoomCreatedCallback` | `data` |

## 🔧 Usage Examples

### Listening to New Messages

```javascript
import {qiscusEvents} from 'qiscus';

// Subscribe
this.listener = qiscusEvents.on('new-messages', (messages) => {
  messages.forEach(message => {
    console.log('New message:', message);
    // Update UI
  });
});

// Unsubscribe
qiscusEvents.off('new-messages', this.listener);
```

### Listening to Typing Events

```javascript
this.typingListener = qiscusEvents.on('typing', (data) => {
  if (data.room_id === this.state.currentRoomId) {
    this.setState({
      isTyping: true,
      typingUsername: data.username
    });
  }
});
```

### Listening to Read Receipts

```javascript
this.readListener = qiscusEvents.on('comment-read', (data) => {
  // Update message status to 'read'
  this.updateMessageStatus(data.comment.id, 'read');
});
```

## ⚠️ Important Notes

### 1. Init Must Be Called First
The EventEmitter bridge only works after `Qiscus.init()` is called:

```javascript
// In App.js
useEffect(() => {
  Qiscus.init(); // This sets up all the callbacks
}, []);
```

### 2. Always Clean Up Listeners
```javascript
componentWillUnmount() {
  // Remove ALL listeners
  qiscusEvents.off('new-messages', this.newMessageListener);
  qiscusEvents.off('comment-read', this.readListener);
  // ... etc
}
```

### 3. EventEmitter vs Qiscus SDK
```javascript
// ❌ WRONG - Qiscus SDK doesn't have this
Qiscus.qiscus.events.on('newmessages', ...)

// ✅ CORRECT - Use our EventEmitter bridge
qiscusEvents.on('new-messages', ...)
```

## 🏗️ Why This Architecture?

### Problem
Qiscus SDK uses callbacks in init options, which are:
- Set once during initialization
- Can't be dynamically subscribed/unsubscribed
- Hard to use in multiple components

### Solution
EventEmitter bridge provides:
- ✅ Multiple components can listen to same event
- ✅ Dynamic subscribe/unsubscribe
- ✅ Standard event pattern
- ✅ Easy cleanup

## 📝 Implementation Checklist

When adding a new component that needs Qiscus events:

1. **Import the bridge:**
   ```javascript
   import {qiscusEvents} from 'qiscus';
   ```

2. **Subscribe in componentDidMount:**
   ```javascript
   componentDidMount() {
     this.listener = qiscusEvents.on('event-name', this.handleEvent);
   }
   ```

3. **Handle the event:**
   ```javascript
   handleEvent = (data) => {
     // Process event data
     this.setState({...});
   }
   ```

4. **Unsubscribe in componentWillUnmount:**
   ```javascript
   componentWillUnmount() {
     qiscusEvents.off('event-name', this.listener);
   }
   ```

## 🔍 Debugging Events

### Check if events are firing:
```javascript
// In app/qiscus/index.js
newMessagesCallback(messages) {
  console.log('🔔 New messages callback fired:', messages);
  qiscusEvents.emit('new-messages', messages);
}
```

### Check if components are listening:
```javascript
// In your component
this.listener = qiscusEvents.on('new-messages', (messages) => {
  console.log('📱 Component received messages:', messages);
});
```

### Check EventEmitter listeners:
```javascript
console.log('Listeners:', qiscusEvents.listenerCount('new-messages'));
```

## 🚀 Benefits

1. **Decoupled** - Components don't depend on Qiscus SDK directly
2. **Flexible** - Easy to add/remove listeners
3. **Testable** - Can mock qiscusEvents in tests
4. **Standard** - Uses familiar EventEmitter pattern
5. **Clean** - Proper cleanup prevents memory leaks

## 📚 Related Files

- `app/qiscus/index.js` - EventEmitter bridge setup
- `app/screens/ChatScreen.js` - Example usage
- `app/screens/RoomListScreen.js` - Example usage
- `App.js` - Qiscus.init() call

## 🔄 Migration from xstream

### Before (xstream - REMOVED)
```javascript
import xs from 'xstream';

Qiscus.newMessage$().subscribe({
  next: (message) => {
    // Handle message
  }
});
```

### After (EventEmitter Bridge)
```javascript
import {qiscusEvents} from 'qiscus';

this.listener = qiscusEvents.on('new-messages', (messages) => {
  // Handle messages
});

// Don't forget cleanup
qiscusEvents.off('new-messages', this.listener);
```

---

**Key Takeaway:** Qiscus SDK uses callbacks in init options. We bridge these to EventEmitter for easier component usage.
