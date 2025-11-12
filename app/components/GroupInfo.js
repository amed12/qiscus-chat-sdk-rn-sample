import React, { useCallback, useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import * as ImagePicker from "react-native-image-picker";

import * as Qiscus from "qiscus";
import toast from "utils/toast";
import Toolbar from "components/Toolbar";
import ContactItem from "components/ContactItem";

function _Toolbar(props) {
  return (
    <Toolbar
      title="Group Info"
      renderLeftButton={() => (
        <TouchableOpacity style={styles.toolbarBtn} onPress={props.onBack}>
          <Image style={styles.icon} source={require("assets/ic_back.png")} />
        </TouchableOpacity>
      )}
      renderRightButton={() => (
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={props.onCreateGroup}
        >
          <Image style={styles.icon} source={require("assets/ic_check.png")} />
        </TouchableOpacity>
      )}
    />
  );
}

export default function _GroupInfo(props) {
  const [name, setName] = React.useState(null);
  const [avatarUrl, setAvatarUrl] = React.useState("https://via.placeholder.com/200x200");
  const createGroup = useCallback(() => {
    const userIds = props.contacts.map(it => it.email);
    Qiscus.qiscus
      .createGroupRoom(name, userIds, { avatarURL: avatarUrl })
      .then(room => {
        props.navigation.replace("Chat", {
          roomId: room.id
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  }, [name, props.contacts]);
  const onSelectImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      toast("Uploading image...");
      const opts = {
        uri: asset.uri,
        name: asset.fileName || 'group-avatar.jpg',
        type: asset.type || 'image/jpeg',
      };
      
      Qiscus.qiscus.upload(opts, (error, progress, fileUrl) => {
        if (error != null) return console.log("error while upload", error);
        if (fileUrl != null) {
          setAvatarUrl(fileUrl);
        }
      });
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, []);
  const onBack = useCallback(() => {
    props.navigation.goBack();
  });

  useEffect(() => console.log(avatarUrl), [avatarUrl]);

  return (
    <View style={styles.container}>
      <_Toolbar onCreateGroup={createGroup} onBack={onBack} />
      <View style={styles.groupInfoContainer}>
        <View style={styles.avatarContainer}>
          <Image style={styles.avatarPreview} source={{ uri: avatarUrl }} />
          <TouchableWithoutFeedback
            style={styles.avatarPickerBtn}
            onPress={onSelectImage}
          >
            <Image
              style={[styles.icon, styles.iconAvatarPicker]}
              source={require("assets/ic_image_attachment.png")}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.groupNameContainer}>
          <Text style={styles.groupNameLabel}>Group Name</Text>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Group name"
            onChangeText={text => setName(text)}
          />
        </View>
      </View>
      <View style={styles.participantListContainer}>
        <View style={styles.participantsHeader}>
          <Text style={styles.participantsHeaderText}>Participants</Text>
        </View>
        <FlatList
          style={styles.participantList}
          initialNumToRender={10}
          keyExtractor={item => `${item.id}`}
          data={props.contacts}
          renderItem={data => (
            <ContactItem
              contact={data.item}
              renderButton={() => (
                <TouchableWithoutFeedback
                  style={styles.removeBtn}
                  onPress={() => props.onRemove(data.item)}
                >
                  <Image
                    style={[styles.icon, styles.selected]}
                    source={require("assets/delete.png")}
                  />
                </TouchableWithoutFeedback>
              )}
            />
          )}
        />
      </View>
    </View>
  );
}

export class GroupInfo extends React.Component {
  state = {
    avatarURL: null,
    name: null
  };

  get selectedContacts() {
    return this.props.contacts;
  }

  render() {
    return (
      <View style={styles.container}>
        <Toolbar
          title="Group Info"
          renderLeftButton={() => (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => this.props.onBack()}
            >
              <Image
                style={styles.icon}
                source={require("assets/ic_back.png")}
              />
            </TouchableOpacity>
          )}
          renderRightButton={() => (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={this._createGroup}
            >
              <Image
                style={styles.icon}
                source={require("assets/ic_check.png")}
              />
            </TouchableOpacity>
          )}
        />

        <View style={styles.groupInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatarPreview}
              source={{ uri: "https://via.placeholder.com/200x200" }}
            />
            <TouchableWithoutFeedback
              style={styles.avatarPickerBtn}
              onPress={this._onSelectImage}
            >
              <Image
                style={[styles.icon, styles.iconAvatarPicker]}
                source={require("assets/ic_image_attachment.png")}
              />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.groupNameContainer}>
            <Text style={styles.groupNameLabel}>Group Name</Text>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Group name"
              onChangeText={text => this.setState({ name: text })}
            />
          </View>
        </View>
        <View style={styles.participantListContainer}>
          <View style={styles.participantsHeader}>
            <Text style={styles.participantsHeaderText}>Participants</Text>
          </View>
          <FlatList
            style={styles.participantList}
            initialNumToRender={10}
            keyExtractor={item => `${item.id}`}
            data={this.selectedContacts}
            renderItem={data => (
              <ContactItem
                contact={data.item}
                renderButton={() => (
                  <TouchableWithoutFeedback
                    style={styles.removeBtn}
                    onPress={() => this._onRemoveContact(data.item)}
                  >
                    <Image
                      style={[styles.icon, styles.selected]}
                      source={require("assets/delete.png")}
                    />
                  </TouchableWithoutFeedback>
                )}
              />
            )}
          />
        </View>
      </View>
    );
  }

  _onSelectImage = () => {};

  _onRemoveContact = contact => {
    this.props.onRemove(contact);
  };
  _createGroup = () => {
    const name = this.state.name;
    const userIds = this.props.contacts.map(it => it.email);
    Qiscus.qiscus
      .createGroupRoom(name, userIds, {})
      .then(room => {
        this.props.navigation.replace("Chat", {
          roomId: room.id
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  };
}

const styles = StyleSheet.create({
  groupInfoContainer: {
    flex: 0,
    flexBasis: 100,
    display: 'flex',
    flexDirection: 'row',
  },
  avatarContainer: {
    flex: 0,
    flexBasis: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarPreview: {
    height: 64,
    width: 64,
    borderRadius: 50,
    position: 'absolute',
  },
  avatarPickerBtn: {
    position: 'absolute',
    height: 64,
    width: 64,
    borderRadius: 50,
    backgroundColor: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNameContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    marginRight: 15,
  },
  groupNameLabel: {
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#979797',
  },
  groupNameInput: {
    padding: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
  },
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  participantListContainer: {
    flex: 1,
    display: 'flex',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  participantsHeader: {
    flex: 0,
    flexBasis: 45,
    flexDirection: 'row',
    height: 45,
    backgroundColor: '#fafafa',
    alignItems: 'flex-end',
    display: 'flex',
    padding: 10,
  },
  participantsHeaderText: {
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#666',
  },
  participantList: {
    padding: 10,
  },
  removeBtn: {
    flex: 0,
    flexBasis: 30,
    width: 30,
    height: 30,
    padding: 10,
    backgroundColor: '#333',
  },
  toolbarBtn: {
    height: 30,
    width: 30,
  },
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  iconAvatarPicker: {},
  selected: {},
});
