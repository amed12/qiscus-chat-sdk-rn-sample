import React, { useEffect, useState } from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	FlatList,
} from 'react-native';
import xs from 'xstream';

import * as Qiscus from 'qiscus';

import RoomItem from 'components/RoomItem';
import Toolbar from 'components/Toolbar';

const RoomListScreen = ({ navigation }) => {
	const [rooms, setRooms] = useState([]);
	const [avatarURI, setAvatarURI] = useState(null);

	useEffect(() => {
		setAvatarURI(Qiscus.currentUser().avatar_url);

		const loginSubscription = Qiscus.isLogin$()
			.filter((isLogin) => isLogin === true)
			.take(1)
			.map(() => xs.from(Qiscus.qiscus.loadRoomList()))
			.flatten()
			.subscribe({
				next: (loadedRooms) => {
					setRooms(loadedRooms);
				},
			});

		const messageSubscription = Qiscus.newMessage$().subscribe({
			next: (message) => {
				handleNewMessage(message);
			},
		});

		// Cleanup subscriptions on component unmount
		return () => {
			loginSubscription.unsubscribe();
			messageSubscription.unsubscribe();
		};
	}, []);

	const handleNewMessage = (message) => {
		const roomId = message.room_id;
		const room = rooms.find((r) => r.id === roomId);
		if (room == null) {
			Qiscus.qiscus.loadRoomList().then((updatedRooms) => {
				setRooms(updatedRooms);
			});
			return;
		}
		room.count_notif = (Number(room.count_notif) || 0) + 1;
		room.last_comment_message = message.message;

		const updatedRooms = rooms.filter((r) => r.id !== roomId);
		setRooms([room, ...updatedRooms]);
		return `Success updating room ${room.id}`;
	};

	const openProfile = () => {
		navigation.push('Profile');
	};

	const onClickRoom = (roomId) => {
		navigation.push('Chat', {
			roomId,
		});
	};

	const openUserList = () => {
		navigation.push('UserList');
	};

	const avatarURL = avatarURI != null ? avatarURI : 'https://via.placeholder.com/120x120';

	return (
		<View style={styles.container}>
			<Toolbar
				title="Conversation"
				renderLeftButton={() => (
					<TouchableOpacity style={styles.btnAvatar} onPress={openProfile}>
						<Image style={styles.avatar} source={{ uri: avatarURL }} />
					</TouchableOpacity>
				)}
				renderRightButton={() => (
					<TouchableOpacity style={styles.btnAvatar} onPress={openUserList}>
						<Image style={styles.iconStartChat} source={require('assets/ic_new_chat.png')} />
					</TouchableOpacity>
				)}
			/>
			<FlatList
				data={rooms}
				keyExtractor={(it) => `key-${it.id}`}
				renderItem={({ item }) => (
					<RoomItem room={item} onClick={(roomId) => onClickRoom(roomId)} />
				)}
			/>
		</View>
	);
};

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

export default RoomListScreen;
