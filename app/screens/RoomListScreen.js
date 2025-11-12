import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  Alert,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Qiscus from 'qiscus';
import {qiscusEvents} from 'qiscus';

import RoomItem from 'components/RoomItem';
import Toolbar from 'components/Toolbar';

export default class RoomListScreen extends React.Component {
  state = {
    rooms: [],
    avatarURI: null,
  };

  componentDidMount() {
    this.loadRooms();
    
    // Listen for new messages from Qiscus callbacks
    this.newMessageListener = qiscusEvents.on('new-messages', (messages) => {
      messages.forEach((message) => this._onNewMessage$(message));
    });
  }
  
  loadRooms = async () => {
    try {
      const currentUser = Qiscus.currentUser();
      if (currentUser) {
        this.setState({
          avatarURI: currentUser.avatar_url,
        });
      }
      
      if (Qiscus.qiscus.isLogin) {
        const rooms = await Qiscus.qiscus.loadRoomList();
        this.setState({rooms});
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  componentWillUnmount() {
    if (this.newMessageListener) qiscusEvents.off('new-messages', this.newMessageListener);
  }

  _onNewMessage$ = (message) => {
    const roomId = message.room_id;
    const room = this.state.rooms.find((r) => r.id === roomId);
    if (room == null) {
      this.componentDidMount()
      return;
    }
    room.count_notif = (Number(room.count_notif) || 0) + 1;
    room.last_comment_message = message.message;

    const rooms = this.state.rooms.filter((r) => r.id !== roomId);
    this.setState({
      rooms: [room, ...rooms],
    });
    return `Success updating room ${room.id}`;
  };

  _openProfile = () => {
    this.props.navigation.push('Profile');
  };
  _onClickRoom = (roomId) => {
    this.props.navigation.push('Chat', {
      roomId,
    });
  };
  _openUserList = () => {
    this.props.navigation.push('UserList');
  };

  _startNewChat = () => {
    Alert.prompt(
      'Start New Chat',
      'Enter the username you want to chat with:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Chat',
          onPress: async (username) => {
            if (!username || username.trim() === '') {
              Alert.alert('Error', 'Please enter a valid username');
              return;
            }
            
            try {
              // Create or get chat room with the user
              console.log('username', username);
              await Qiscus.qiscus.chatTarget(username.trim()).then((room) => {
                console.log('room', room);
                // this.props.navigation.push('Chat', {
                //   roomId: room.id,
                // });
              });
            } catch (error) {
              console.error('Error starting chat:', error);
              Alert.alert('Error', 'Failed to start chat. Please try again.');
            }
          },
        },
      ],
      'plain-text',
    );
  };

  _renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('assets/logo.png')}
          style={styles.emptyLogo}
        />
        <Text style={styles.emptyTitle}>Oops! No chats here yet</Text>
        <Text style={styles.emptySubtitle}>
          Start a conversation and connect with others
        </Text>
        <TouchableOpacity
          style={styles.startChatButton}
          onPress={this._startNewChat}>
          <Text style={styles.startChatText}>Let's Chat!</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const avatarURL =
      this.state.avatarURI != null
        ? this.state.avatarURI
        : 'https://via.placeholder.com/120x120';
    const {rooms} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <Toolbar
          title="Conversation"
          renderLeftButton={() => (
            <TouchableOpacity
              style={styles.btnAvatar}
              onPress={this._openProfile}>
              <Image style={styles.avatar} source={{uri: avatarURL}} />
            </TouchableOpacity>
          )}
          renderRightButton={() => (
            <TouchableOpacity
              style={styles.btnAvatar}
              onPress={this._openUserList}>
              <Image
                style={styles.iconStartChat}
                source={require('assets/ic_new_chat.png')}
              />
            </TouchableOpacity>
          )}
        />
        <FlatList
          data={rooms}
          keyExtractor={(it) => `key-${it.id}`}
          renderItem={({item}) => (
            <RoomItem
              room={item}
              onClick={(roomId) => this._onClickRoom(roomId)}
            />
          )}
          ListEmptyComponent={this._renderEmptyState}
          contentContainerStyle={rooms.length === 0 ? styles.emptyList : null}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 30,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  startChatButton: {
    backgroundColor: '#9aca62',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
    shadowColor: '#9aca62',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startChatText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  btnAvatar: {
    height: 30,
    width: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0,
    flexShrink: 0,
    flexBasis: 30,
    borderRadius: 50,
  },
  iconStartChat: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  avatar: {
    height: 30,
    width: 30,
    resizeMode: 'cover',
    borderRadius: 50,
  },
});
