import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback
} from "react-native";
import debounce from "lodash/debounce";

import * as Qiscus from "qiscus";
import Toolbar from "components/Toolbar";
import ContactItem from "components/ContactItem";
import SelectedContactItem from "components/SelectedContactItem";
import LoadMore from "components/LoadMore";

export default class ContactChooser extends React.Component {
  state = {
    contacts: {},
    selected: []
  };

  async componentDidMount() {
    if (Qiscus.qiscus.isLogin) {
      try {
        const users = await this.loadContacts();
        const usersWithSelection = users.map(user => ({ ...user, selected: false }));
        const contacts = usersWithSelection.reduce((res, it) => {
          res[it.id] = it;
          return res;
        }, {});
        this.setState({ contacts });
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    }
  }

  render() {
    const { contacts, selectedContacts } = this;

    return (
      <View style={styles.container}>
        <Toolbar
          title="Choose Contacts"
          renderLeftButton={() => (
            <TouchableOpacity style={styles.toolbarBtn} onPress={this._onBack}>
              <Image
                style={styles.icon}
                source={require("assets/ic_back.png")}
              />
            </TouchableOpacity>
          )}
          renderRightButton={() => (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={this._onSubmit}
            >
              <Image
                style={styles.icon}
                source={require("assets/ic_next.png")}
              />
            </TouchableOpacity>
          )}
        />

        <View style={styles.searchContainer}>
          <Image
            style={styles.iconSearch}
            source={require("assets/ic_magnifier.png")}
          />
          <TextInput
            style={styles.inputSearch}
            placeholder="Search"
            onChangeText={this._onSearch}
          />
        </View>

        {selectedContacts.length > 0 && (
          <FlatList
            style={styles.selectedContacts}
            horizontal={true}
            data={selectedContacts}
            keyExtractor={item => `${item.id}`}
            renderItem={({ item }) => (
              <SelectedContactItem
                contact={item}
                onRemove={() => this._removeContact(item)}
              />
            )}
          />
        )}

        <View style={styles.contactList}>
          <View style={styles.separator}>
            <Text style={styles.separatorText}>Contacts</Text>
          </View>
          <FlatList
            style={styles.contactFlatList}
            initialNumToRender={20}
            data={contacts}
            keyExtractor={item => `${item.id}`}
            renderItem={({ item }) => this._contactItem(item)}
          />
        </View>
      </View>
    );
  }

  loadContacts = (query = "", page = 1) => {
    const perPage = 200;
    return Qiscus.qiscus
      .getUsers(query, page, perPage)
      .then(resp => resp.users);
  };

  _onSearch = debounce(text => {
    console.log("on:search", text);
    this.loadContacts(text).then(users =>
      this.setState({
        contacts: users
      })
    );
  });
  _onBack = () => this.props.onBack();
  _removeContact = contact => {
    this.setState(state => ({
      selected: state.selected.filter(it => it.id !== contact.id)
    }));
  };
  _addContact = contact => {
    this.setState(state => ({
      selected: [...state.selected, contact]
    }));
  };
  _onSelectContact = contact => {
    const selected = this.state.selected;
    const _contact = selected.find(it => it.id === contact.id);
    if (_contact == null) this._addContact(contact);
    else this._removeContact(contact);
  };

  _contactItem(item) {
    if (item.type && item.type === "load-more") {
      return <LoadMore onPress={() => this.loadContacts(null, 1)} />;
    }
    return (
      <ContactItem
        contact={item}
        onSelect={() => this._onSelectContact(item)}
        renderButton={() =>
          item.selected && (
            <TouchableWithoutFeedback onPress={() => this._removeContact(item)}>
              <Image
                style={[styles.icon, styles.selected]}
                source={require("assets/ic_selected.png")}
              />
            </TouchableWithoutFeedback>
          )
        }
      />
    );
  }

  _onSubmit = () => {
    this.props.onSubmit(this.selectedContacts);
  };

  get isLoadAble() {
    return false;
  }

  get contacts() {
    const contacts = Object.values(this.state.contacts).map(item => ({
      ...item,
      selected: this.state.selected.findIndex(it => it.id === item.id) >= 0
    }));
    if (this.isLoadAble) {
      contacts.push({ type: "load-more", text: "Load more" });
    }
    return contacts;
  }

  get selectedContacts() {
    return this.state.selected;
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%',
  },
  toolbarBtn: {
    height: 30,
    width: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0,
    flexShrink: 0,
    flexBasis: 30,
    borderRadius: 50,
  },
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  inputSearch: {
    color: '#979797',
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexBasis: 45,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    flex: 0,
    flexDirection: 'column',
    flexBasis: 45,
    height: 45,
    paddingLeft: 10,
    backgroundColor: '#fafafa',
    justifyContent: 'flex-end',
    display: 'flex',
  },
  separatorText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  selectedContacts: {
    flex: 0,
    flexShrink: 0,
    flexBasis: 70,
    marginTop: 10,
  },
  contactList: {
    flex: 1,
    flexBasis: 'auto',
    display: 'flex',
  },
  contactFlatList: {
    flex: 1,
    flexBasis: 'auto',
    height: '100%',
  },
  selected: {
    height: 25,
    width: 25,
    borderRadius: 50,
    overflow: 'hidden',
    resizeMode: 'contain',
    marginRight: 10,
  },
});
