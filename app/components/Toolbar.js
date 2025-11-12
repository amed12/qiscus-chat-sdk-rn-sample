import React from "react";
import { View, TouchableWithoutFeedback, StyleSheet, Text } from "react-native";
export default class Toolbar extends React.PureComponent {
  render() {
    return (
      <View style={styles.container}>
        {this.props.renderLeftButton && this.props.renderLeftButton()}
        <TouchableWithoutFeedback
          style={styles.titleButton}
          onPress={this._onPress}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{this.props.title}</Text>
            {this.props.renderMeta && this.props.renderMeta()}
          </View>
        </TouchableWithoutFeedback>
        {this.props.renderRightButton && this.props.renderRightButton()}
      </View>
    );
  }

  _onPress = () => {
    this.props.onPress && this.props.onPress();
  };
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 48,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  titleButton: {
    flex: 1,
    flexBasis: '100%',
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    marginLeft: 10,
  },
  title: {
    flex: 1,
    flexBasis: '100%',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'left',
    color: '#362c33',
  },
});
