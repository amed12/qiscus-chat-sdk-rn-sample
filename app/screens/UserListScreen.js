import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import * as Qiscus from "qiscus";
import Toolbar from "components/Toolbar";
import UserItem from "components/UserItem";

export default class UserListScreen extends React.Component {
  state = { users: [] };
  perPage = 100;

  _onUserClick = async userId => {
    try {
      const room = await Qiscus.qiscus.chatTarget(userId);
      this.props.navigation.push("Chat", {
        roomId: room.id
      });
    } catch (error) {
      console.log("error when getting room", error);
    }
  };

  _loadUsers = async (query = null) => {
    try {
      const resp = await Qiscus.qiscus.getUsers(query, 1, this.perPage);
      this.setState({ users: resp.users });
    } catch (error) {
      console.log("Error when getting user list", error);
    }
  };

  _onBack = () => {
    this.props.navigation.goBack();
  };

  _onEndReached = ({ distanceFromEnd }) => {
    // console.log("on end reached", distanceFromEnd);
  };

  componentDidMount() {
    if (Qiscus.qiscus.isLogin) {
      this._loadUsers();
    }
  }

  _renderItem = item => {
    if (item.type === "load-more") return this._loadMore();
    return (
      <UserItem user={item} onPress={() => this._onUserClick(item.email)} />
    );
  };

  render() {
    const users = this.state.users;
    return (
      <View style={styles.container}>
        <Toolbar
          title="Choose Contacts"
          renderLeftButton={() => (
            <TouchableOpacity onPress={this._onBack}>
              <Image source={require("assets/ic_back.png")} />
            </TouchableOpacity>
          )}
        />
        <View>
          <TouchableOpacity
            style={styles.createGroupBtn}
            onPress={this._onCreateGroup}
          >
            <Image
              style={styles.createGroupIcon}
              source={require("assets/ic_new_chat-group.png")}
            />
            <Text style={styles.createGroupBtnText}>Create Group Chat</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator}>
          <Text style={styles.separatorText}>Contact</Text>
        </View>
        <FlatList
          data={users}
          keyExtractor={it => `key-${it.email}`}
          onEndReached={this._onEndReached}
          renderItem={({ item }) => this._renderItem(item)}
        />
      </View>
    );
  }

  _onCreateGroup = () => {
    this.props.navigation.navigate("CreateGroup");
  };
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%',
  },
  createGroupBtn: {
    flex: 0,
    flexBasis: 45,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingLeft: 10,
  },
  createGroupBtnText: {
    fontSize: 14,
    color: '#2c2c36',
    padding: 6,
  },
  createGroupIcon: {},
  separator: {
    flex: 0,
    backgroundColor: '#fafafa',
    padding: 5,
    height: 40,
    flexBasis: 'auto',
    justifyContent: 'flex-end',
  },
  separatorText: {
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#666',
  },
});
