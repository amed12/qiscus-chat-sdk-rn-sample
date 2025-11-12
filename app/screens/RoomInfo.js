import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Text,
  FlatList
} from "react-native";
import toast from "utils/toast";

import * as Qiscus from "qiscus";
import Toolbar from "components/Toolbar";
import ContactItem from "components/ContactItem";
import ContactChooser from "components/ContactChooser";

export default class RoomInfo extends React.Component {
  state = {
    page: "info",
    room: {},
    name: null,
    isEditingName: false
  };

  async componentDidMount() {
    const roomId = this.props.route.params?.roomId ?? null;
    if (roomId == null) return;
    
    if (Qiscus.qiscus.isLogin) {
      try {
        const room = await this._loadRoomInfo(roomId);
        this.setState({ room: room, name: room.room_name });
      } catch (error) {
        console.error('Error loading room info:', error);
      }
    }
  }

  render() {
    if (this.state.page === "info") return this._render();
    else {
      return (
        <ContactChooser
          onBack={() =>
            this.setState({
              page: "info"
            })
          }
          onSubmit={this._onSubmit}
        />
      );
    }
  }
  _render() {
    const { room, isEditingName } = this.state;
    const isSingle = room.chat_type === "single";

    return (
      <View style={styles.container}>
        <Toolbar
          title="Room Info"
          renderLeftButton={() => (
            <TouchableOpacity onPress={this._onBack}>
              <Image source={require("assets/ic_back.png")} />
            </TouchableOpacity>
          )}
        />

        <View style={styles.avatarContainer}>
          <Image style={styles.avatar} source={{ uri: room.avatar_url }} />
          {!isSingle && (
            <RoomMeta
              name={this.state.name}
              isEditing={isEditingName}
              onChangeName={this._onChangeName}
              onEditName={this._onEditName}
              onSubmit={this._onSubmitName}
              onEditAvatar={this._onEditAvatar}
            />
          )}
        </View>

        <View style={styles.infoContainer}>
          {room == null && <Text>Loading data ...</Text>}
          {isSingle && <SingleInfo user={this.participant} />}
          {!isSingle && (
            <GroupInfo
              room={this.state.room}
              contacts={this.participants}
              onAddUser={this._onAddUser}
              onRemove={this._onRemove}
            />
          )}
        </View>
      </View>
    );
  }

  get participant() {
    return this.participants.slice().pop();
  }
  get participants() {
    if (this.state.room.participants == null) return [];
    return this.state.room.participants.filter(
      it => it.email !== Qiscus.currentUser().email
    );
  }

  _onRemove = async contact => {
    console.log("on:remove", contact);
    try {
      await Qiscus.qiscus.removeParticipantsFromGroup(this.state.room.id, [contact.email]);
      this.setState(state => ({
        room: {
          ...state.room,
          participants: state.room.participants.filter(
            it => it.id !== contact.id
          )
        }
      }));
      toast("Success removing participant");
    } catch (error) {
      console.log("failed removing participant", error);
    }
  };
  _onAddUser = () => {
    console.log("on_add");
    this.setState({ page: "choose" });
  };
  _onSubmit = async contacts => {
    const userIds = contacts.map(it => it.email);
    try {
      const users = await Qiscus.qiscus.addParticipantsToGroup(this.state.room.id, userIds);
      this.setState(state => ({
        page: "info",
        room: {
          ...state.room,
          participants: [...state.room.participants, ...users]
        }
      }));
    } catch (error) {
      console.log("failed adding participants", error);
    }
  };
  _onChangeName = name => this.setState({ name });
  _onSubmitName = async () => {
    if (this.state.name == null) return;
    if (this.state.name.length === 0) return;
    console.log("on:submit name", this.state.name);
    try {
      await Qiscus.qiscus.updateRoom({
        id: this.state.room.id,
        room_name: this.state.name
      });
      this.setState({ isEditingName: false });
    } catch (error) {
      console.error('Error updating room name:', error);
    }
  };
  _onEditName = () => {
    this.setState(state => ({
      isEditingName: !state.isEditingName
    }));
  };
  _onEditAvatar = () => {
    console.log("on:change-avatar");
  };
  _onBack = () => {
    this.props.navigation.goBack();
  };
  _loadRoomInfo = async roomId => {
    try {
      const resp = await Qiscus.qiscus.getRoomsInfo({ room_ids: [`${roomId}`] });
      return resp.results.rooms_info.pop();
    } catch (error) {
      console.log("error when getting room info", error);
      throw error;
    }
  };
}

function RoomMeta(props) {
  const inputStyle = [styles.changeNameInput];
  if (props.isEditing) inputStyle.push(styles.changeNameInputEditing);

  return (
    <View style={styles.changeContainer}>
      <TextInput
        style={inputStyle}
        editable={props.isEditing}
        onChangeText={props.onChangeName}
        onSubmitEditing={props.onSubmit}
        value={props.name}
      />
      <TouchableOpacity style={styles.changeNameBtn} onPress={props.onEditName}>
        <Image style={styles.icon} source={require("assets/ic_edit.png")} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.changeNameBtn}
        onPress={props.onEditAvatar}
      >
        <Image
          style={styles.icon}
          source={require("assets/ic_image_attachment.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

function SingleInfo(props) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Information</Text>
      </View>
      <View style={styles.fieldGroup}>
        <View style={styles.fieldIcon}>
          <Image
            style={[styles.icon]}
            source={require("assets/ic_contact.png")}
          />
        </View>
        <Text style={styles.fieldText}>{props.user.username}</Text>
      </View>
      <View style={styles.fieldGroup}>
        <View style={styles.fieldIcon}>
          <Image style={[styles.icon]} source={require("assets/ic_id.png")} />
        </View>
        <Text style={styles.fieldText}>{props.user.email}</Text>
      </View>
    </>
  );
}

function GroupInfo(props) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Participants</Text>
      </View>
      <View style={styles.addUserContainer}>
        <TouchableOpacity style={styles.addUserBtn} onPress={props.onAddUser}>
          <Image style={styles.icon} source={require("assets/ic_id.png")} />
          <Text style={styles.addUserText}>Add Participants</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.contactList}
        initialNumToRender={10}
        keyExtractor={item => `${item.id}`}
        data={props.contacts}
        disableVirtualization={false}
        renderItem={data => (
          <ContactItem
            contact={data.item}
            renderButton={() => (
              <TouchableOpacity
                style={styles.removeParticipantBtn}
                onPress={() => props.onRemove(data.item)}
              >
                <Image
                  style={styles.icon}
                  source={require("assets/delete.png")}
                />
              </TouchableOpacity>
            )}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%',
  },
  avatarContainer: {
    flex: 0,
    height: 200,
    flexBasis: 200,
    backgroundColor: 'lightblue',
    overflow: 'hidden',
  },
  avatar: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  changeContainer: {
    position: 'absolute',
    bottom: 0,
    height: 45,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 5,
  },
  changeNameInput: {
    flex: 1,
    flexBasis: 100,
    width: 100,
    fontSize: 16,
    color: '#fff',
    padding: 0,
    paddingLeft: 10,
  },
  changeNameInputEditing: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    color: '#333',
  },
  changeNameBtn: {
    flex: 0,
    flexBasis: 35,
    height: 35,
    width: 35,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
    display: 'flex',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  header: {
    height: 35,
    padding: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  headerText: {
    backgroundColor: '#fafafa',
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#666',
    letterSpacing: 0.5,
  },
  fieldGroup: {
    flex: 0,
    flexBasis: 46,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  fieldIcon: {
    flex: 0,
    flexBasis: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  fieldText: {
    backgroundColor: 'white',
    padding: 10,
    flex: 1,
    fontSize: 14,
    color: '#2c2c36',
  },
  fieldButton: {
    width: 46,
    height: 46,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUserContainer: {
    flex: 0,
    flexBasis: 45,
    height: 45,
  },
  addUserBtn: {
    display: 'flex',
    flexDirection: 'row',
    height: 45,
    flexBasis: 45,
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    backgroundColor: 'white',
  },
  addUserText: {
    paddingLeft: 10,
  },
  removeParticipantBtn: {
    height: 30,
    width: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
