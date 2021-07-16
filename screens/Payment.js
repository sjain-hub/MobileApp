import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    Pressable,
    TouchableOpacity,
    TextInput,
    FlatList,
    Linking,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import StepIndicator from 'react-native-step-indicator';


const Payment = ({ route, navigation }) => {

    const [order, setOrder] = React.useState();

    React.useEffect(() => {
        let { order } = route.params;
        setOrder(order)
        navigation.addListener('beforeRemove', (e) => {
            if (order.paymentOption != "Advance Payment") {
                return;
            } else {
                e.preventDefault();
            }
        });
    }, [navigation])

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', height: 50, paddingLeft: 20, }}>
                {order?.paymentOption == "Advance Payment" ?
                    null :
                    <TouchableOpacity
                        style={{
                            width: 50,
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
                    </TouchableOpacity>}
                <View
                    style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        width: width * 0.6
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>PAYMENT</Text>
                </View>
            </View>
        )
    }

    function renderPaymentDetails() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: "System", fontSize: 18, marginVertical: 20 }}>Scan QR Code to pay</Text>
                <View style={{ height: width * 0.6, width: width * 0.6, borderRadius: 10, ...styles.shadow }}>
                    <Image
                        source={{ uri: config.url + order?.kitchen.QRCode }}
                        resizeMode="cover"
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 10
                        }}
                    />
                </View>
                <Text style={{ fontFamily: "System", fontWeight: 'bold', fontSize: 22, marginVertical: 30 }}>OR</Text>
                <Text style={{ fontFamily: "System", fontSize: 16 }}>Click the below link to Pay</Text>
                <Text style={{ color: 'blue', fontSize: 18, marginVertical: 10 }}
                    onPress={() => Linking.openURL(order?.kitchen.paytmLink)}>
                    {order?.kitchen.paytmLink}
                </Text>
                {order?.paymentOption == "Advance Payment" ?
                    <TouchableOpacity
                        style={{ backgroundColor: '#ff0033', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 120, ...styles.shadow }}
                    >
                        <Text style={{ fontFamily: "System", fontWeight: 'bold', color: 'white', fontSize: 16 }}>CANCEL ORDER</Text>
                    </TouchableOpacity>
                    :
                    null
                }
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderPaymentDetails()}
        </SafeAreaView>
    )
}

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
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    }
})

export default Payment;