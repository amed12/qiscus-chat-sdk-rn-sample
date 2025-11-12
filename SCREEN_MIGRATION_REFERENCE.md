# Screen Component Migration Reference

## Quick Reference for Updating Screen Components

All screen components need to be updated to work with React Navigation 6. Here's how:

## Navigation Props Changes

### Class Components

**Before (React Navigation v4):**
```javascript
class ChatScreen extends React.Component {
  componentDidMount() {
    const roomId = this.props.navigation.getParam('roomId', null);
    this.props.navigation.navigate('RoomList');
  }
}
```

**After (React Navigation 6):**
```javascript
class ChatScreen extends React.Component {
  componentDidMount() {
    const roomId = this.props.route.params?.roomId ?? null;
    this.props.navigation.navigate('RoomList');
  }
}
```

### Functional Components

**Before:**
```javascript
function ChatScreen(props) {
  const roomId = props.navigation.getParam('roomId', null);
  props.navigation.navigate('RoomList');
}
```

**After (Option 1 - Props):**
```javascript
function ChatScreen({ navigation, route }) {
  const roomId = route.params?.roomId ?? null;
  navigation.navigate('RoomList');
}
```

**After (Option 2 - Hooks):**
```javascript
import { useNavigation, useRoute } from '@react-navigation/native';

function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const roomId = route.params?.roomId ?? null;
  
  navigation.navigate('RoomList');
}
```

## Common Navigation Methods

All these remain the same:
```javascript
// Navigate to a screen
navigation.navigate('ScreenName', { param1: 'value' });

// Go back
navigation.goBack();

// Replace current screen
navigation.replace('ScreenName');

// Reset navigation state
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

// Push (for stack navigator)
navigation.push('ScreenName');

// Pop
navigation.pop();
```

## Files That Need Updates

### Priority 1 (Critical - Used in App.js)
- [x] `app/screens/LoginScreen.js` - Already has both class and functional versions
- [ ] `app/screens/ProfileScreen.js`
- [ ] `app/screens/RoomListScreen.js`
- [ ] `app/screens/ChatScreen.js` - Uses `getParam` extensively
- [ ] `app/screens/UserListScreen.js`
- [ ] `app/screens/CreateGroupScreen.js`
- [ ] `app/screens/RoomInfo.js`

### Search & Replace Patterns

1. **Replace getParam calls:**
   - Find: `this.props.navigation.getParam('paramName', defaultValue)`
   - Replace: `this.props.route.params?.paramName ?? defaultValue`

2. **Replace navigation.replace calls (if any):**
   - These should work the same, but verify the syntax

## Example: ChatScreen.js Updates

### Lines to Update in ChatScreen.js

**Line 42 (componentDidMount):**
```javascript
// Before:
const roomId = this.props.navigation.getParam('roomId', null);

// After:
const roomId = this.props.route.params?.roomId ?? null;
```

**Line 460 (_loadMore method):**
```javascript
// Before:
const roomId = this.props.navigation.getParam('roomId', null);

// After:
const roomId = this.props.route.params?.roomId ?? null;
```

## TypeScript Types (For Future Migration)

```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
  RoomList: undefined;
  Chat: { roomId: string };
  UserList: undefined;
  CreateGroup: undefined;
  RoomInfo: { roomId: string };
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

// Class component
class ChatScreen extends React.Component<ChatScreenProps> {
  componentDidMount() {
    const { roomId } = this.props.route.params;
  }
}

// Functional component
const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { roomId } = route.params;
};
```

## Testing Navigation Changes

After updating each screen, test:
1. ✅ Can navigate TO the screen
2. ✅ Can navigate FROM the screen
3. ✅ Parameters are passed correctly
4. ✅ Back button works
5. ✅ No console warnings

## Quick Fix Script

You can use this regex find/replace in your editor:

**Find:**
```regex
this\.props\.navigation\.getParam\('(\w+)',\s*([^)]+)\)
```

**Replace:**
```
this.props.route.params?.$1 ?? $2
```

This will automatically convert most getParam calls.

## Common Errors & Fixes

### Error: "undefined is not an object (evaluating 'this.props.navigation.getParam')"
**Fix:** Update to use `this.props.route.params?.paramName`

### Error: "Cannot read property 'params' of undefined"
**Fix:** Ensure the component is rendered within a Stack.Screen

### Warning: "Non-serializable values were found in the navigation state"
**Fix:** Don't pass functions or complex objects as params. Use IDs instead.

## Next Steps After Screen Migration

1. Test all navigation flows
2. Verify params are passed correctly
3. Check deep linking (if used)
4. Update any navigation-related tests
5. Consider converting to TypeScript for better type safety
