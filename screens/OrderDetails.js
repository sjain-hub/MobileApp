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
    Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import paid from '../assets/icons/paid.png';
import StepIndicator from 'react-native-step-indicator';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';


const OrderDetails = ({ route, navigation }) => {

    const [order, setOrder] = React.useState();
    const [trackOrder, setTrackOrder] = React.useState(false);
    const [currentPosition, setCurrentPosition] = React.useState(3);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const customStyles = {
        stepIndicatorSize: 22,
        currentStepIndicatorSize: 22,
        separatorStrokeWidth: 2,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: '#FC6D3F',
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: '#FC6D3F',
        stepStrokeUnFinishedColor: 'lightgray',
        separatorFinishedColor: '#FC6D3F',
        separatorUnFinishedColor: 'lightgray',
        stepIndicatorFinishedColor: '#FC6D3F',
        stepIndicatorUnFinishedColor: '#ffffff',
        stepIndicatorCurrentColor: '#ffffff',
        stepIndicatorLabelFontSize: 0,
        currentStepIndicatorLabelFontSize: 0,
        stepIndicatorLabelCurrentColor: 'transparent',
        stepIndicatorLabelFinishedColor: 'transparent',
        stepIndicatorLabelUnFinishedColor: 'transparent',
        labelColor: 'gray',
        labelSize: 16,
        currentStepLabelColor: '#FC6D3F',
        labelAlign: 'flex-start'
    }

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

    const getColor = (status) => {
        if (status == "Delivered" || status == "Picked") {
            return "#4BB543"
        }
        else if (status == "Rejected" || status == "Cancelled") {
            return "red"
        }
        else if (status == "Waiting" || status == "Placed" || status == "Payment" || status == "Preparing" || status == "Ready" || status == "Dispatched") {
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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>{trackOrder ? "ORDER STATUS" : "ORDER DETAILS"}</Text>
                </View>
                {trackOrder ?
                    null
                    :
                    <View
                        style={{
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, color: getColor(order?.status), fontWeight: 'bold' }}>{order?.status}</Text>
                    </View>}
            </View>
        )
    }

    function renderCartItems() {
        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
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
                        <Text style={{ fontFamily: "System", fontSize: 18 }}>{order?.kitchen.kitName}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.kitchen.landmark}</Text>
                    </View>
                </View>
                <View style={{ marginVertical: 20 }}>
                    <Text style={{ fontFamily: "System", fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Items</Text>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>{order?.itemswithquantity}</Text>
                </View>
                {order?.message ?
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Message</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.message}</Text>
                    </View>
                    :
                    null
                }
            </View>
        )
    }

    function renderContactInfo() {
        const goToDialpad = (phoneno) => {
            if (Platform.OS == "android") {
                Linking.openURL('tel:${'+phoneno+'}')
            } else {
                Linking.openURL('telprompt:${'+phoneno+'}')
            }
        }

        const goToMaps = (lat, lng, kitchen) => {
            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${lat},${lng}`;
            const label = kitchen;
            const url = Platform.select({
                ios: `${scheme}${label}&ll=${latLng}`,
                android: `${scheme}${latLng}(${label})`
            });
            Linking.openURL(url)
        }

        return (
            <View style={{ paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' }}>
                <TouchableOpacity
                    style={{ backgroundColor: 'white', paddingVertical: 12, borderRadius: 10, ...styles.shadow, width: width*0.9, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center' }}
                    onPress={() => goToDialpad(order?.kitchen.paytmNo)}
                >
                    <Ionicons name="call" size={24} color="#FC6D3F" />
                    <Text style={{ fontFamily: "System", fontSize: 16, color: "#FC6D3F", alignSelf: 'center', marginLeft: 10 }}>CALL KITCHEN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: 'white', paddingVertical: 12, borderRadius: 10, ...styles.shadow, width: width*0.9, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}
                    onPress={() => goToMaps(order?.kitchen.latitude, order?.kitchen.longitude, order?.kitchen.kitName)}
                >
                    <MaterialCommunityIcons name="map-marker-path" size={26} color="#FC6D3F" />
                    <Text style={{ fontFamily: "System", fontSize: 16, color: "#FC6D3F", alignSelf: 'center', marginLeft: 10 }}>OPEN DIRECTIONS</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 6,
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
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Placed On</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Scheduled On</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>{order?.status} On</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', width: '50%' }}>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10 }}>{getFormattedDate(order?.created_at)}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10 }}>{getFormattedDate(order?.scheduled_order)}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10 }}>{getFormattedDate(order?.completed_at)}</Text>
                    </View>
                </View>
            </View>
        )
    }

    function renderAddress() {
        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Your Address</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.delivery_addr}</Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Mode</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.mode}</Text>
                </View>
            </View>
        )
    }

    function renderBillingDetails() {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>Billing Details</Text>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ width: width * 0.75 }}>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>Sub-Total</Text>
                        {order?.kit_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>Kitchen Discount</Text>
                            : null
                        }
                        {order?.coup_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>Coupon Discount</Text>
                            : null
                        }
                        {order?.mode == "Delivery" ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>Delivery Charge</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>Total Amount</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: "System", fontSize: 14 }}>{'\u20B9'}{order?.sub_total}</Text>
                        {order?.kit_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14, color: 'green' }}>- {'\u20B9'}{order?.kit_discount}</Text>
                            : null
                        }
                        {order?.coup_discount > 0 ?
                            <Text style={{ fontFamily: "System", fontSize: 14, color: 'green' }}>- {'\u20B9'}{order?.coup_discount}</Text>
                            : null
                        }
                        {order?.mode == "Delivery" ?
                            <Text style={{ fontFamily: "System", fontSize: 14 }}>{'\u20B9'}{order?.delivery_charge}</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>{'\u20B9'}{order?.total_amount}.00</Text>
                    </View>
                </View>
                {order?.balance == 0 ?
                    <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={paid}
                            resizeMode="contain"
                            style={{
                                height: width * 0.16
                            }}
                        />
                    </View>
                    :
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Payment", {
                            order: order
                        })}
                    >
                        <Text style={{ fontFamily: "System", fontSize: 16, marginTop: 20, color: '#FC6D3F' }}>Pay Online now?</Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    function renderKitchensMessage() {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 20, padding: 10, backgroundColor: '#F5F5F6' }}>
                <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Message from Kitchen</Text>
                <Text style={{ fontFamily: "System", fontSize: 14 }}>{order?.msgtocust}</Text>
            </View>
        )
    }

    function currentOrderStatus() {
        var labels = []

        const getLabels = () => {
            if (order.mode == "Delivery") {
                labels = ["Placed", "Preparing", "Ready", "Dispatched"]
            } else {
                labels = ["Placed", "Preparing", "Ready"]
            }
            // if (order.paymentOption == "Advance Payment") {
            //     labels = ["Payment", ...labels]
            // }
            return labels
        }

        const calcCurrentStatus = () => {
            return labels.indexOf(order.status)
        }

        const renderStatusData = () => {
            if (order.status == "Placed") {
                return (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: width*0.56}}>
                        <Foundation name="clipboard-pencil" size={220} color="lightgray" />
                    </View>
                )
            } else if (order.status == "Preparing") {
                return (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: width*0.56}}>
                        <MaterialCommunityIcons name="coffee-maker" size={220} color="lightgray" />
                    </View>
                )
            } else if (order.status == "Ready") {
                return (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: width*0.56}}>
                        <Octicons name="package" size={220} color="lightgray" />
                    </View>
                )
            } else if (order.status == "Dispatched") {
                return (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: width*0.56}}>
                        <MaterialCommunityIcons name="scooter" size={220} color="lightgray" />
                    </View>
                )
            }
        }

        const renderStepIndicator = () => (
            <AntDesign name="check" size={16} color="white" />
          );

        return (
            <View style={{ marginVertical: 20, marginHorizontal: 20 }}>
                <View style={{ height: height * 0.4, flexDirection: 'row' }}>
                    <View style={{ width: width * 0.3 }}>
                        <StepIndicator
                            direction="vertical"
                            renderStepIndicator={renderStepIndicator}
                            stepCount={getLabels().length}
                            customStyles={customStyles}
                            currentPosition={calcCurrentStatus()}
                            labels={getLabels()}
                        />
                    </View>
                    {renderStatusData()}
                </View>
            </View>
        )
    }

    function renderCancelButton() {
        return (
            <View style={{ paddingHorizontal: 20, backgroundColor: '#F5F5F6', paddingVertical: 20 }}>
                <TouchableOpacity
                    style={{ backgroundColor: '#ff0033', paddingVertical: 12, borderRadius: 10, ...styles.shadow, alignItems: 'center' }}
                >
                    <Text style={{ fontFamily: "System", fontWeight: 'bold', color: 'white', fontSize: 16 }}>CANCEL ORDER</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function renderFooter() {
        return (
            <View style={{ borderStyle: 'solid', borderWidth: 20, borderColor: '#F5F5F6', width: width }}></View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderGap()}
            <ScrollView>
                {renderCartItems()}
                {renderGap()}
                {trackOrder ? currentOrderStatus() : renderDates()}
                {trackOrder ? renderContactInfo() : null}
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
                {order?.status == "Placed" ? renderCancelButton() : null}
                {renderGap()}
                {renderFooter()}
            </ScrollView>
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