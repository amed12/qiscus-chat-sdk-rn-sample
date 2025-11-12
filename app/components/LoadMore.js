import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
export default class LoadMore extends React.Component {
  render() {
    return (
      <TouchableOpacity style={styles.container}
                        onPress={this.props.onPress}>
        <Text style={styles.text}>Load more</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'green',
    height: 30,
    borderRadius: 5,
  },
  text: {
    color: 'white',
  },
});
