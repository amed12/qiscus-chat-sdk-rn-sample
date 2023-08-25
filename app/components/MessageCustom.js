import React from "react";
import {View, Text, Image, TouchableWithoutFeedback} from "react-native";
import {isVideoFile} from "../qiscus";
import * as Qiscus from "../qiscus";

export default class MessageCustom extends React.Component {
  render() {
    const {onLongClick, message} = this.props;
    const imageURI = message.payload.content.url;
    const type = message.payload.type;

    return (
      <View
        style={{
          height: 200,
          width: 200,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <TouchableWithoutFeedback
          style={{
            width: 200,
            height: 150,
            flex: 1,
            flexBasis: 150
          }}
          onLongPress={() => {
              if (onLongClick) onLongClick();
          }}
        >
          {type === "image" && (
            <Image
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              source={{ uri: isVideoFile(imageURI) ? Qiscus.qiscus.getThumbnailURL(imageURI) : imageURI }}
            />
          )}
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
