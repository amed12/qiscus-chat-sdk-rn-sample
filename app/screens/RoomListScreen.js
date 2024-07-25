import React from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	FlatList,
} from 'react-native';
import xs from 'xstream';
import { withNavigationFocus } from 'react-navigation';

import * as Qiscus from 'qiscus';

import RoomItem from 'components/RoomItem';
import Toolbar from 'components/Toolbar';

class RoomListScreen extends React.Component {
	state = {
		rooms: [],
		avatarURI: null,
		listLastProcessedMessageId: [], // Track the list of processed message IDs
	};

	componentDidMount() {
		this.setState({
			avatarURI: Qiscus.currentUser().avatar_url,
		});
		this.loadInitialData();
	}

	componentDidUpdate(prevProps) {
		// IMPORTANT: To refresh room list count after exit app/go another app
		if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused) {
			this._loadRoomList();
		}
	}

	componentWillUnmount() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		if (this.subscription2) {
			this.subscription2.unsubscribe();
		}
	}

	loadInitialData = () => {
		const subscription = Qiscus.isLogin$()
			.filter((isLogin) => isLogin === true)
			.take(1)
			.map(() => xs.from(Qiscus.qiscus.loadRoomList()))
			.flatten()
			.subscribe({
				next: (rooms) => {
					this.fetchRoomDetails(rooms);
					subscription.unsubscribe();
				},
			});
		this.subscription = Qiscus.newMessage$().subscribe({
			next: (message) => {
				this._onNewMessage$(message);
			},
		});
	};

	fetchRoomDetails = async (rooms) => {
		const roomIds = rooms.map((room) => String(room.id));
		const params = {
			room_ids: roomIds,
			show_participants: false,
			show_removed: false,
		};
		try {
			const response = await Qiscus.qiscus.getRoomsInfo(params);
			const roomDetails = response.results.rooms_info;
			const updatedRooms = rooms.map((room) => {
				const detail = roomDetails.find((details) => details.id === room.id);
				if (detail) {
					return {
						...room,
						count_notif: detail.unread_count,
					};
				}
				return room;
			});

			// Update the list of processed message IDs with last_comment_id
			const listLastProcessedMessageId = [
				...this.state.listLastProcessedMessageId,
				...updatedRooms.map((room) => room.last_comment_id),
			].filter((value, index, self) => self.indexOf(value) === index); // Ensure no duplicates

			this.setState({ rooms: updatedRooms, listLastProcessedMessageId });
		} catch (error) {
			console.error('Error fetching room details:', error);
		}
	};

	_onNewMessage$ = (message) => {
		const roomId = message.room_id;
		const messageId = message.id;

		// Check if the message has already been processed
		const maxProcessedMessageId = Math.max(
			...this.state.listLastProcessedMessageId,
			0
		);
		//prevent double count process
		if (messageId <= maxProcessedMessageId) {
			return;
		}

		const room = this.state.rooms.find((r) => r.id === roomId);
		if (room == null) {
			this._loadRoomList();
			return;
		}

		room.count_notif = (Number(room.count_notif) || 0) + 1;
		room.last_comment_message = message.message;

		const rooms = this.state.rooms.filter((r) => r.id !== roomId);
		this.setState((prevState) => ({
			rooms: [room, ...rooms],
			listLastProcessedMessageId: [
				...prevState.listLastProcessedMessageId,
				messageId,
			], // Update the list of processed message IDs
		}));
		return `Success updating room ${room.id}`;
	};

	_loadRoomList = () => {
		Qiscus.qiscus.loadRoomList().then((rooms) => {
			this.fetchRoomDetails(rooms);
		});
	};

	_openProfile = () => {
		this.props.navigation.push('Profile');
	};

	_onClickRoom = (roomId) => {
		const updatedRooms = this.state.rooms.map((room) =>
			room.id === roomId ? { ...room, count_notif: 0 } : room
		);
		this.setState({ rooms: updatedRooms });
		this.props.navigation.push('Chat', {
			roomId,
		});
	};

	_openUserList = () => {
		this.props.navigation.push('UserList');
	};

	render() {
		const avatarURL =
			this.state.avatarURI != null
				? this.state.avatarURI
				: 'https://via.placeholder.com/120x120';
		const { rooms } = this.state;
		return (
			<View style={styles.container}>
				<Toolbar
					title="Conversation"
					renderLeftButton={() => (
						<TouchableOpacity
							style={styles.btnAvatar}
							onPress={this._openProfile}>
							<Image style={styles.avatar} source={{ uri: avatarURL }} />
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
					renderItem={({ item }) => (
						<RoomItem
							room={item}
							onClick={(roomId) => this._onClickRoom(roomId)}
						/>
					)}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: '100%',
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

export default withNavigationFocus(RoomListScreen);
