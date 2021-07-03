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
    FlatList
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";


const Orders = ({ route, navigation }) => {

    const [orders, setOrders] = React.useState();
    var  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("authToken").then((value) => {
                if (value) {
                    fetch(config.url + '/userapi/apporders', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Token ' + value
                        }
                    }).then((response) => response.json())
                        .then((json) => {
                            setOrders(json.orders)
                        }).catch((error) => {
                             if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
                        });
                }
            });
        });
        return unsubscribe;
    }, [navigation])

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 10,
                borderColor: '#F5F5F6',
            }}></View>
        )
    }

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
                <View
                    style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>ORDERS</Text>
                </View>
            </View>
        )
    }

    function renderOrders() {

        const getFormattedDate = (timestamp) => {
            var date = new Date(timestamp)
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
            return (date.getDate() + " " + months[date.getMonth()] + ", " + (date.getHours()>12 ? date.getHours()-12 + ":" + (date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes()) + " pm" : date.getHours() + ":" + (date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes()) + " am"))
        }

        const getColor = (status) => {
            if (status=="Delivered" || status=="Picked") {
                return "#4BB543"
            }
            else if (status=="Rejected" || status=="Cancelled") {
                return "red"
            }
            else if (status=="Waiting" || status=="Placed" || status=="Accepted" || status=="Preparing" || status=="Packed" || status=="Dispatched") {
                return "#FFCC00"
            }
        }

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{width: width*0.9, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 10, backgroundColor: 'white', marginVertical: 16, ...styles.shadow}}
                onPress={() => navigation.navigate("OrderDetails", {
                    order: item
                })}
            >
                <View style={{flexDirection: 'row'}}>
                    <View style={{width: '70%', marginRight: 5}}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{item.kitchen.kitName}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginBottom: 10 }}>{'\u20B9'}{item.total_amount}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'gray', marginBottom: 10 }}>{item.itemswithquantity}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12, color: 'gray', marginBottom: 10 }}>{getFormattedDate(item.scheduled_order)}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end', width: '30%'}}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginBottom: 10, color: getColor(item.status), fontWeight: 'bold' }}>{item.status}</Text>
                    </View>
                </View>
                {getColor(item.status) == "#FFCC00" ?
                    <View style={{ height: 40, backgroundColor: '#FFCC00', alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginVertical: 10}}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Track Order</Text>
                    </View>
                    :
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <TouchableOpacity
                            style={{
                                height: 30,
                                width: '40%',
                                borderColor: 'green',
                                borderWidth: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 14
                            }}
                            // onPress={() => {
                            //     setCouponApplied()
                            //     navigation.navigate("Account", {
                            //         cameFrom: true
                            //     })
                            // }}
                        >
                            <Text style={{ color: 'green', fontSize: 12 }}>Rate Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: 30,
                                width: '40%',
                                borderColor: 'red',
                                borderWidth: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 14
                            }}
                            // onPress={() => {
                            //     setCouponApplied()
                            //     navigation.navigate("Account", {
                            //         cameFrom: true
                            //     })
                            // }}
                        >
                            <Text style={{ color: 'red', fontSize: 12 }}>Help</Text>
                        </TouchableOpacity>
                    </View>
                }
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={orders}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingVertical: 20,
                }}
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderGap()}
            {renderOrders()}
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
        elevation: 5,
    }
})

export default Orders;