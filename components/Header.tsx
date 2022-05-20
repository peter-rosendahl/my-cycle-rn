import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';

const Header: React.FC<{title: string, profileName?: string | null}> = ({title, profileName}) => {
    return (
        <View style={style.wrapper}>
            <Text style={style.title}>{title}</Text>
            { 
              <Text style={[style.title, style.smaller, style.grey]}>({profileName || "Please sign in if you want your information to be stored online."})</Text>
            }
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
  },
  smaller: {
    fontSize: 16,
    width: 300
  },
  grey: {
    color: "#999999"
  }
})

export default Header;