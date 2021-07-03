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


const OrderDetails = ({ route, navigation }) => {

    const [order, setOrder] = React.useState();
    const [trackOrder, setTrackOrder] = React.useState(false);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            let { order } = route.params;
            setOrder(order)
            if (getColor(order.status) == '#FFCC00') {
                setTrackOrder(true)
            }
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

    const getColor = (status) => {
        if (status == "Delivered" || status == "Picked") {
            return "#4BB543"
        }
        else if (status == "Rejected" || status == "Cancelled") {
            return "red"
        }
        else if (status == "Waiting" || status == "Placed" || status == "Accepted" || status == "Preparing" || status == "Packed" || status == "Dispatched") {
            return "#FFCC00"
        }
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
                        width: width * 0.6
                    }}
                >
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>ORDER DETAILS</Text>
                </View>
                <View
                    style={{
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 18, marginLeft: 10, color: getColor(order?.status), fontWeight: 'bold' }}>{order?.status}</Text>
                </View>
            </View>
        )
    }

    function renderCartItems() {
        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <Image
                        source={{ uri: config.url + order?.kitchen.dp }}
                        resizeMode="cover"
                        style={{
                            width: width * 0.25,
                            height: 100,
                            borderRadius: 20,
                            marginRight: 20
                        }}
                    />
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18 }}>{order?.kitchen.kitName}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{order?.kitchen.landmark}</Text>
                    </View>
                </View>
                <View style={{ marginVertical: 20 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Items</Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>{order?.itemswithquantity}</Text>
                </View>
                {order?.message ?
                    <View style={{ marginVertical: 20 }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Message</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{order?.message}</Text>
                    </View>
                    :
                    null
                }
            </View>
        )
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 7,
                borderColor: '#F5F5F6',
            }}></View>
        )
    }

    function renderDates() {
        const getFormattedDate = (timestamp) => {
            var date = new Date(timestamp)
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
            return (date.getDate() + " " + months[date.getMonth()] + ", " + (date.getHours() > 12 ? date.getHours() - 12 + ":" + (date.getMinutes().toString().length > 1 ? date.getMinutes() : "0" + date.getMinutes()) + " pm" : date.getHours() + ":" + (date.getMinutes().toString().length > 1 ? date.getMinutes() : "0" + date.getMinutes()) + " am"))
        }

        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <View style={{ width: '50%' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Placed On</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Scheduled On</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>{order?.status} On</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', width: '50%' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginBottom: 10 }}>{getFormattedDate(order?.created_at)}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginBottom: 10 }}>{getFormattedDate(order?.scheduled_order)}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginBottom: 10 }}>{getFormattedDate(order?.completed_at)}</Text>
                    </View>
                </View>
            </View>
        )
    }

    function renderAddress() {
        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Address</Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{order?.delivery_addr}</Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Mode</Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{order?.mode}</Text>
                </View>
            </View>
        )
    }

    function renderBillingDetails() {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>Billing Details</Text>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ width: width * 0.75 }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Sub-Total</Text>
                        {order?.kit_discount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Kitchen Discount</Text>
                            : null
                        }
                        {order?.coup_discount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Coupon Discount</Text>
                            : null
                        }
                        {order?.mode == "Delivery" ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Delivery Charge</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>Total Amount</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{'\u20B9'}{order?.sub_total}</Text>
                        {order?.kit_discount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'green' }}>- {'\u20B9'}{order?.kit_discount}</Text>
                            : null
                        }
                        {order?.coup_discount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'green' }}>- {'\u20B9'}{order?.coup_discount}</Text>
                            : null
                        }
                        {order?.mode == "Delivery" ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{'\u20B9'}{order?.delivery_charge}</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>{'\u20B9'}{order?.total_amount}.00</Text>
                    </View>
                </View>
            </View>
        )
    }

    function renderKitchensMessage() {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 20, padding: 10, backgroundColor: '#F5F5F6' }}>
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Message from Kitchen</Text>
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{order?.msgtocust}</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderGap()}
            {trackOrder?
                <ScrollView>
                    
                </ScrollView>
                :
                <ScrollView>
                    {renderCartItems()}
                    {renderGap()}
                    {renderDates()}
                    {renderGap()}
                    {renderAddress()}
                    {renderGap()}
                    {renderBillingDetails()}
                    {renderGap()}
                    {order?.msgtocust ?
                        renderKitchensMessage()
                        :
                        null
                    }
                </ScrollView>
            }
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

export default OrderDetails;