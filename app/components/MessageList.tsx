import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  PermissionsAndroid,
  ListRenderItemInfo,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import debounce from 'lodash.debounce';
import * as dateFns from 'date-fns';
import * as Qiscus from '../qiscus';
import type { IQMessage, IQAccount } from '../qiscus';
import MessageUpload from './MessageUpload';
import MessageCustom from './MessageCustom';
import MessageAttachment from './MessageAttachment';
import toast from '../utils/toast';

interface AnimatedSendingProps {}

class AnimatedSending extends React.Component<AnimatedSendingProps> {
  animation = new Animated.Value(0);

  componentDidMount() {
    const timing = Animated.timing(this.animation, {
      toValue: 1,
      duration: 2000,
      isInteraction: false,
      useNativeDriver: true,
    });
    Animated.loop(timing).start();
  }

  render() {
    const spin = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <Animated.Image
        source={require('../../assets/ic_sending.png')}
        style={[
          styles.iconStatus,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      />
    );
  }
}

interface MessageListProps {
  messages: IQMessage[];
  onLoadMore: () => void;
}

interface MessageListState {
  writePermissionGranted: boolean;
  currentUserData: IQAccount | null;
}

type MessageWithDate = Omit<IQMessage, 'type'> & {
  type?: 'text' | 'file_attachment' | 'reply' | 'custom' | 'date' | 'upload' | 'load-more';
  date?: string;
};

export default class MessageList extends React.Component<MessageListProps, MessageListState> {
  state: MessageListState = {
    writePermissionGranted: false,
    currentUserData: null,
  };

  flatListRef = React.createRef<FlatList<MessageWithDate>>();

  async componentDidMount() {
    // Get current user data for v3
    const userData = await Qiscus.currentUser();
    this.setState({ currentUserData: userData });
    
    // Scroll to bottom on initial load
    setTimeout(() => this.scrollToBottom(), 100);
  }

  componentDidUpdate(prevProps: MessageListProps) {
    // Auto-scroll to bottom when new messages arrive
    if (prevProps.messages.length !== this.props.messages.length) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  scrollToBottom = () => {
    if (this.flatListRef.current && this.props.messages.length > 0) {
      this.flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  _messageListFormatter = (messages: IQMessage[]): MessageWithDate[] => {
    const _messages: MessageWithDate[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const lastMessage = messages[i - 1];
      const messageDate = new Date(message.timestamp);
      const lastMessageDate = lastMessage == null ? null : new Date(lastMessage.timestamp);
      const isSameDay = lastMessageDate ? dateFns.isSameDay(messageDate, lastMessageDate) : false;
      const showDate = lastMessage != null && !isSameDay;

      const dateMessage: MessageWithDate = {
        ...message,
        id: message.id,
        type: 'date',
        date: dateFns.format(messageDate, 'dd MMM yyyy'),
      };

      if (i === 0 || showDate) _messages.push(dateMessage);
      _messages.push(message);
    }

    return _messages;
  };

  _renderMessage = (message: MessageWithDate) => {
    const type = message.type || 'text';
    const currentUser = this.state.currentUserData;
    // SDK v3: Use sender.id instead of user_id
    const isMe = currentUser ? message.sender?.id === currentUser.id : false;
    const isLoadMore = type === 'load-more';
    const isDate = type === 'date';
    const isCustomMessage =
      type === 'custom' && message.payload && typeof message.payload.content !== 'string';

    const containerStyle: any[] = [styles.container];
    if (isMe) containerStyle.push(styles.containerMe);
    if (isDate || isLoadMore) containerStyle.push(styles.containerDate);

    const messageStyle: any[] = [styles.message];
    if (isMe) messageStyle.push(styles.messageMe);
    if (isDate || isLoadMore) messageStyle.push(styles.messageDate);

    const textStyle: any[] = [styles.messageText];
    if (isDate) textStyle.push(styles.messageTextDate);

    const showMeta = isMe && !isDate && !isLoadMore;
    const showMetaOther = !isMe && !isDate && !isLoadMore;

    // SDK v3: Use text instead of message
    let content = <Text style={textStyle}>{message.text}</Text>;

    if (type === 'upload') content = this._renderUploadMessage(message);
    if (isCustomMessage && message.payload?.type === 'image')
      content = this._renderCustomImageMessage(message);

    if (isCustomMessage && message.payload?.type !== 'image')
      content = this._renderCustomMessageAttachment(message);

    return (
      <View style={containerStyle}>
        {showMeta && this._renderMessageMeta(message)}
        <View style={messageStyle}>
          {isLoadMore && (
            <TouchableWithoutFeedback onPress={this.props.onLoadMore}>
              {content}
            </TouchableWithoutFeedback>
          )}
          {!isLoadMore && <>{content}</>}
        </View>
        {showMetaOther && this._renderMessageMetaOther(message)}
      </View>
    );
  };

  _renderUploadMessage = (message: any) => <MessageUpload message={message} />;

  _requestWritePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const fileGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (fileGranted === PermissionsAndroid.RESULTS.GRANTED) {
          this.setState({ writePermissionGranted: true });
        } else {
          this.setState({ writePermissionGranted: false });
        }
      } else {
        this.setState({ writePermissionGranted: true });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  _onDownload = debounce(async (url: string, fileName: string) => {
    await this._requestWritePermission();
    if (!this.state.writePermissionGranted) {
      toast('Permission denied');
      return;
    }

    const { config, fs } = ReactNativeBlobUtil;
    const downloads = fs.dirs.DownloadDir;
    return config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${downloads}/${fileName}`,
      },
    })
      .fetch('GET', url)
      .then(() => {
        toast('File downloaded');
      })
      .catch((err) => {
        console.log('err', err);
        toast('Download failed');
      });
  }, 300);

  _renderCustomImageMessage = (message: any) => <MessageCustom message={message} />;

  _renderCustomMessageAttachment = (message: any) => (
    <MessageAttachment item={message} onDownload={this._onDownload} />
  );

  _renderMessageMeta = (message: MessageWithDate) => {
    const status = message.status;
    const isRead = status === 'read';
    const isDelivered = status === 'delivered';
    const isSent = status === 'sent';
    const isSending = status === 'sending';
    const isFailed = status === 'failed';

    return (
      <View style={styles.messageMeta}>
        {isSending && <AnimatedSending />}
        {isSent && <Image source={require('../../assets/ic_delivered.png')} style={styles.iconStatus} />}
        {isDelivered && (
          <Image source={require('../../assets/ic_delivered.png')} style={styles.iconStatus} />
        )}
        {isRead && <Image source={require('../../assets/ic_read.png')} style={styles.iconStatus} />}
        {isFailed && <Image source={require('../../assets/failed-send.png')} style={styles.iconStatus} />}
        <Text style={styles.messageMetaText}>{dateFns.format(new Date(message.timestamp), 'HH:mm')}</Text>
      </View>
    );
  };

  _renderMessageMetaOther = (message: MessageWithDate) => {
    return (
      <View style={styles.messageMeta}>
        <Text style={styles.messageMetaText}>{dateFns.format(new Date(message.timestamp), 'HH:mm')}</Text>
      </View>
    );
  };

  _renderItem = ({ item }: ListRenderItemInfo<MessageWithDate>) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      );
    }

    const message = item;
    const currentUser = this.state.currentUserData;
    // SDK v3: Use sender.id instead of user_id
    const isOwn = currentUser ? message.sender?.id === currentUser.id : false;
    const containerStyle = isOwn ? styles.ownMessageContainer : styles.otherMessageContainer;
    const bubbleStyle = isOwn ? styles.ownBubble : styles.otherBubble;

    return (
      <View style={containerStyle}>
        <View style={bubbleStyle}>{this._renderMessage(message)}</View>
      </View>
    );
  };

  _keyExtractor = (item: MessageWithDate) => {
    return item.type === 'date' ? `date-${item.id}` : item.id.toString();
  };

  render() {
    const messages = this._messageListFormatter(this.props.messages);

    return (
      <FlatList
        ref={this.flatListRef}
        style={styles.list}
        data={messages}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        onContentSizeChange={() => this.scrollToBottom()}
      />
    );
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#4a4848ff',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  containerMe: {
    justifyContent: 'flex-end',
  },
  containerDate: {
    justifyContent: 'center',
  },
  message: {
    maxWidth: '70%',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  messageMe: {
    backgroundColor: '#e1ffc7',
  },
  messageDate: {
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  messageTextDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  messageMetaText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 5,
  },
  iconStatus: {
    width: 16,
    height: 16,
  },
  dateContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  otherMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  ownBubble: {
    backgroundColor: '#dcf8c6',
    borderRadius: 8,
    padding: 10,
    maxWidth: '70%',
  },
  otherBubble: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    maxWidth: '70%',
  },
});
