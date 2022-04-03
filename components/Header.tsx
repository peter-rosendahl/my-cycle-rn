import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';

const Header: React.FC<{title: string}> = ({title}) => {
    return (
        <View style={style.wrapper}>
            <Text style={style.title}>{title}</Text>
        </View>
    )
}

const style = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    height: 100
  },
  title: {
    textAlign: "center",
    color: "#DEC4FF",
    fontWeight: "600",
    fontSize: 24
  }
})

export default Header;