import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    SafeAreaView,
} from "react-native";
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const NoInternet = ({ route, navigation }) => {

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', height: 50 }}>
                <TouchableOpacity
                    style={{
                        width: 50,
                        paddingLeft: 20,
                        justifyContent: 'center'
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={back}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20
                        }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    function renderIcon() {
        return (
            <View style={{flex: 1, alignItems: 'center', top: height*0.2}}>
                <MaterialIcons name="signal-cellular-connected-no-internet-4-bar" size={200} color={'lightgray'} />
                <Text style={{ fontFamily: "System", fontSize: 18, marginVertical: 10, fontWeight: 'bold' }}>CONNECTION ERROR!</Text>
                <Text style={{ fontFamily: "System", fontSize: 14 }}>Something went wrong</Text>
                <Text style={{ fontFamily: "System", fontSize: 14 }}>Check your Internet Connection.</Text>
                <TouchableOpacity 
                    style={{marginTop: 20, width: 80, height: 40, backgroundColor: '#ff0033', borderRadius: 10, justifyContent: 'center', ...styles.shadow}}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ fontFamily: "System", fontSize: 18, color: 'white', alignSelf: 'center' }}>Retry</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderIcon()}
        </SafeAreaView>
    )

}

export default NoInternet;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 5,
    }
})