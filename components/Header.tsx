import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    StyleSheet
} from 'react-native';

const Header: React.FC<{title: string, profileName?: string | null}> = ({title, profileName}) => {

  const openPrivacy = async() => {
    await Linking.openURL("https://prmedia.dk/terms/my-cycle");
  }

    return (
        <View style={style.wrapper}>
            <Text style={style.title}>{title}</Text>
            { 
              <Text style={[style.title, style.smaller, style.grey]}>({profileName || "Please sign in if you want your information to be stored online."})</Text>
            }
            <TouchableOpacity onPress={openPrivacy}>
              <Text style={{color: "#333333", textDecorationLine:"underline"}}>Read Privacy Policy</Text>
            </TouchableOpacity>
        </View>
    )
}

const style = StyleSheet.create({
  wrapper: {
    display: "flex",
    borderColor:"#DEC4FF",
    borderBottomWidth: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 18
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