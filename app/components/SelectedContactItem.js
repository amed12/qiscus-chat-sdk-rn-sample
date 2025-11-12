import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
export default class SelectedContactItem extends React.PureComponent {
  render() {
    const {contact} = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Image style={styles.avatar} source={{uri: contact.avatar_url}}/>
          <TouchableOpacity style={styles.remove} onPress={() => this.props.onRemove()}>
            <Image style={styles.icon} source={require('assets/delete.png')}/>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}
              numberOfLines={1}>
          {contact.name || contact.email}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 80,
    width: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    margin: 0,
    marginLeft: 5,
    marginRight: 5,
    paddingTop: 5,
    flexShrink: 0,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    position: 'relative',
    borderRadius: 50,
    flexBasis: 40,
  },
  avatar: {
    height: 40,
    width: 40,
    resizeMode: 'cover',
    borderRadius: 50,
    overflow: 'hidden',
  },
  remove: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'transparent',
    borderWidth: 0,
    height: 20,
    width: 20,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 13,
    color: '#333',
    flex: 0,
    flexBasis: 40,
    height: 40,
    overflow: 'hidden',
    width: 44,
    textAlign: 'center',
    padding: 0,
  },
});
