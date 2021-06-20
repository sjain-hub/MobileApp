import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    FlatList,
    Pressable,
    TouchableOpacity,
    TextInput,
} from "react-native";
import Modal from 'react-native-modal';
const { width, height } = Dimensions.get("window");
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import back from "../assets/icons/back.png";
import veg from "../assets/icons/veg.png";
import nonveg from "../assets/icons/nonveg.png";
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RadioButton } from 'react-native-paper';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePicker from '@react-native-community/datetimepicker';


const Cart = ({ route, navigation }) => {

    const [kitchen, setKitchen] = React.useState(null);
    const [cartItems, setCartItems] = React.useState(null);
    const [cartEmpty, setCartEmpty] = React.useState(false);
    const [ASItems, setASItems] = React.useState([]);
    const [totalItems, setTotalItems] = React.useState();
    const [addresses, setAddresses] = React.useState(null);
    const [coupons, setCoupons] = React.useState(null);
    const [removeItemModal, setRemoveItemModal] = React.useState(false);
    const [tempSelectedItem, setTempSelectedItem] = React.useState();
    const [msgToKitchen, setMsgToKitchen] = React.useState();
    const [couponModal, setCouponModal] = React.useState(false);
    const [couponApplied, setCouponApplied] = React.useState();
    const [subTotal, setSubTotal] = React.useState(0);
    const [kitDiscount, setKitDiscount] = React.useState(0);
    const [couponDiscount, setCouponDiscount] = React.useState(0);
    const [toPay, setToPay] = React.useState(0);
    const [mode, setMode] = React.useState("PickUp");
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [selectedAddress, setSelectedAddress] = React.useState();
    const [dateTimePicker, setDateTimePicker] = React.useState(false);
    const [advanceOrder, setAdvanceOrder] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState();
    const [dateMode, setDateMode] = React.useState('date');
    const [minDate, setMinDate] = React.useState();
    const [maxDate, setMaxDate] = React.useState();
    const [orderButtonRaise, setOrderButtonRaise] = React.useState();

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            let { raiseButton } = route.params;
            setOrderButtonRaise(raiseButton)
            AsyncStorage.getItem("authToken").then((token) => {
                if (token) {
                    setLoggedIn(true)
                    AsyncStorage.getItem("kitchen").then((kitId) => {
                        if (kitId) {
                            fetchCartData(kitId, token)
                        } else {
                            setCartEmpty(true)
                        }
                    });
                }
                else {
                    AsyncStorage.getItem("kitchen").then((kitId) => {
                        if (kitId) {
                            fetchCartData(kitId,)
                        } else {
                            setCartEmpty(true)
                        }
                    });
                }
            });

            setDates()
        });
        return unsubscribe;
    }, [navigation]);

    function setDates() {
        let a = new Date()
        setMinDate(a)

        let b = new Date()
        b.setDate(a.getDate() + 2)
        // b.setHours(23)
        // b.setMinutes(59)
        setMaxDate(b)

        c = new Date()
        c.setHours(c.getHours() + 2)
        setSelectedDate(c)
    }

    async function removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    function fetchCartData(kitId, token) {
        AsyncStorage.getItem("orderItems").then((value) => JSON.parse(value))
            .then((items) => {
                setASItems(items)
                fetch(config.url + '/userapi/appcart', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: token? 'Token ' + token : ''
                    },
                    body: JSON.stringify({
                        "kitId": kitId,
                        "cartItems": items
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        if (json.items.length != 0) {
                            setKitchen(json.kitchen)
                            setCartItems(json.items)
                            setAddresses(json.addresses)
                            setSelectedAddress(json.addresses[0])
                            setCoupons(json.kitCoupons)
                            calcBill(json.items, items, couponApplied, mode)
                        }
                        else {
                            setCartEmpty(true)
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
            });
    }

    function calcBill(cartitems, asitems, coupon, mode) {
        let subtotal = 0
        let kitdiscount = 0
        let coupondisc = 0
        let total = 0
        let totalItems = 0
        asitems?.map(item => {
            let cartitem = cartitems?.filter(a => a.id == item.itemId)[0]
            if (cartitem) {
                subtotal = subtotal + (cartitem.price * item.qty)
                kitdiscount = kitdiscount + ((cartitem.offer / 100 * cartitem.price) * item.qty)
                totalItems = totalItems + item.qty
            }
        })
        if (coupon) {
            coupondisc = (subtotal - kitdiscount) * coupon.discount / 100
            if (coupondisc > coupon.maxDiscount) {
                coupondisc = coupon.maxDiscount
            }
        }
        total = subtotal - kitdiscount - coupondisc
        if (mode == "Delivery" && total!=0) {
            total = total + kitchen.deliveryCharge
        }
        setSubTotal(subtotal);
        setKitDiscount(kitdiscount);
        setCouponDiscount(coupondisc);
        setToPay(Math.round(total));
        setTotalItems(totalItems)
        if (totalItems == 0) {
            setCartEmpty(true)
            removeItemValue('kitchen')
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
            </View>
        )
    }

    function renderOrderButton() {
        return (
            <View
                style={{
                    position: 'absolute',
                    height: 120,
                    bottom: orderButtonRaise ? 50 : 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    borderColor: 'lightgray',
                    borderTopWidth: 0.5,
                    backgroundColor: 'white'
                }}
            >
                {loggedIn ?
                    <TouchableOpacity
                        style={{
                            height: 50,
                            width: width * 0.9,
                            backgroundColor: '#FC6D3F',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            marginVertical: 10
                        }}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Proceed To Pay</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        style={{
                            height: 50,
                            width: width * 0.9,
                            backgroundColor: '#FC6D3F',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            marginVertical: 10
                        }}
                        onPress={() => {
                            setCouponApplied()
                            navigation.navigate("Account", {
                                cameFrom: true
                            })
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Login</Text>
                    </TouchableOpacity>
                }

            </View>
        )
    }

    function getOrderQty(itemId) {
        let orderItem = []
        if (typeof itemId == 'string') {
            orderItem = ASItems.filter(a => {
                if (typeof a.itemId == 'string' && (a.itemId == itemId || a.itemId.includes(itemId))) {
                    return true;
                } else {
                    return false;
                }
            })
        } else {
            orderItem = ASItems.filter(a => a.itemId == itemId)
        }

        if (orderItem.length > 0) {
            let qty = 0
            orderItem.map((item) => {
                qty = qty + item.qty
            })
            return qty
        }
        return 0
    }

    function checkMinQty(itemId) {
        let totalQty = 0
        if (typeof itemId == 'string') {
            totalQty = getOrderQty(itemId.split('-')[0] + '-')
        } else {
            totalQty = getOrderQty(itemId)
        }
        let item = cartItems.filter(a => a.id == itemId)[0]
        if (totalQty > item.minOrder) {
            subtractQty(itemId, false)
        }
        else {
            setTempSelectedItem(itemId)
            setRemoveItemModal(true)
        }
    }

    function addQty(itemId) {
        let orderList = ASItems.slice()
        let orderitem = orderList.filter(a => a.itemId == itemId)
        orderitem[0].qty = orderitem[0].qty + 1
        setASItems(orderList)
        calcBill(cartItems, orderList, couponApplied, mode)
        AsyncStorage.setItem('orderItems', JSON.stringify(orderList))
    }

    function subtractQty(itemId, removeItem) {
        let orderList = ASItems.slice()
        let orderitem = orderList.filter(a => a.itemId == itemId)
        if (removeItem) {
            if (typeof itemId == 'string') {
                let id = itemId.split('-')[0] + '-'
                orderitem = orderList.filter(a => {
                    if (typeof a.itemId == 'string' && a.itemId.includes(id)) {
                        return true;
                    } else {
                        return false;
                    }
                })
                orderitem.map((item) => {
                    item.qty = 0
                })
            } else {
                orderitem[0].qty = 0
            }
        } else {
            orderitem[0].qty = orderitem[0].qty - 1
        }
        setASItems(orderList)
        calcBill(cartItems, orderList, couponApplied, mode)
        AsyncStorage.setItem('orderItems', JSON.stringify(orderList))
    }

    function renderRemoveItemModal() {
        return (
            <Modal
                isVisible={removeItemModal}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 35,
                }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>Do you wish to remove this item?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%' }}
                            onPress={() => setRemoveItemModal(!removeItemModal)}
                        >
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, color: '#FC6D3F' }}>No</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setRemoveItemModal(!removeItemModal)
                                subtractQty(tempSelectedItem, true)
                            }}
                        >
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, color: '#FC6D3F' }}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function getTotalCost(price, qty) {
        return price * qty
    }

    function renderCartItems() {
        return (
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <Image
                        source={{ uri: config.url + kitchen?.dp }}
                        resizeMode="cover"
                        style={{
                            width: width * 0.25,
                            height: 100,
                            borderRadius: 20,
                            marginRight: 20
                        }}
                    />
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18 }}>{kitchen?.kitName}</Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{kitchen?.landmark}</Text>
                    </View>
                </View>

                {cartItems?.map((item) => {
                    return (
                        getOrderQty(item.id) > 0 ?
                            <View key={item.id} style={{ marginTop: 20 }}>
                                <View style={{ flexDirection: 'row', width: width, marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', width: '45%', alignSelf: 'center' }}>
                                        {item.type == "veg" ?
                                            <Image
                                                source={veg}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    alignSelf: 'center'
                                                }}
                                            /> :
                                            <Image
                                                source={nonveg}
                                                style={{
                                                    width: 17,
                                                    height: 17,
                                                    alignSelf: 'center'
                                                }}
                                            />}
                                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginLeft: 5, lineHeight: 18, width: '90%' }}>{item.name}</Text>
                                    </View>
                                    <View
                                        style={{
                                            width: '30%',
                                            height: 35,
                                            justifyContent: 'center',
                                            flexDirection: 'row',
                                            marginLeft: 5
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{
                                                width: 35,
                                                backgroundColor: 'white',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderTopLeftRadius: 25,
                                                borderBottomLeftRadius: 25,
                                                ...styles.shadow
                                            }}
                                            activeOpacity={0.5}
                                            onPress={() => checkMinQty(item.id)}
                                        >
                                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 30, lineHeight: 32, color: 'green' }}>-</Text>
                                        </TouchableOpacity>

                                        <View
                                            style={{
                                                width: 35,
                                                backgroundColor: 'white',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                ...styles.shadow
                                            }}
                                        >
                                            <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, lineHeight: 25, color: 'green' }}>{getOrderQty(item.id)}</Text>
                                        </View>

                                        <TouchableOpacity
                                            style={{
                                                width: 35,
                                                backgroundColor: 'white',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderTopRightRadius: 25,
                                                borderBottomRightRadius: 25,
                                                ...styles.shadow
                                            }}
                                            activeOpacity={0.5}
                                            onPress={() => addQty(item.id)}
                                        >
                                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, lineHeight: 25, color: 'green' }}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold', alignSelf: 'center', marginLeft: 10 }}>{'\u20B9'}{getTotalCost(item.price, getOrderQty(item.id))}</Text>
                                </View>
                                <View style={{
                                    borderStyle: 'dotted',
                                    borderWidth: 1,
                                    borderRadius: 1,
                                    borderColor: '#F5F5F6',
                                }}>
                                </View>
                            </View>
                            : null
                    )
                })}
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

    function renderMessageTextbox() {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 20, marginHorizontal: 20 }}>
                <View
                    style={{
                        width: 40,
                        justifyContent: 'center',
                    }}
                >
                    <Entypo name="new-message" size={22} color={'gray'} />
                </View>
                <View
                    style={{
                        height: 40,
                        width: '90%',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingHorizontal: 30,
                        backgroundColor: '#F5F5F6',
                    }}
                >
                    <TextInput
                        style={{ fontFamily: "Roboto-Bold", fontSize: 14, width: '100%' }}
                        onChangeText={(text) => setMsgToKitchen(text)}
                        placeholder="Any message to the Kitchen?"
                    >
                    </TextInput>
                </View>
            </View>
            )
    }

    function renderCoupons() {
        return (
            couponApplied ?
                <View style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20 }}>
                    <View style={{ width: 50, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialIcons name="check-circle" size={30} color={'green'} />
                    </View>
                    <View style={{ flexDirection: 'row', width: width - 120, alignItems: 'center' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>COUPON APPLIED : </Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', width: '50%', marginLeft: 5 }}>{couponApplied.code}</Text>
                    </View>
                    <TouchableOpacity
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            setCouponApplied()
                            calcBill(cartItems, ASItems, null, mode)
                        }}
                    >
                        <Entypo name="circle-with-cross" size={22} color={'lightgray'} />
                    </TouchableOpacity>
                </View>
                :
                <TouchableOpacity
                    style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20 }}
                    onPress={() =>
                        setCouponModal(true)}
                >
                    <View style={{ width: 50, alignItems: 'center' }}>
                        <MaterialIcons name="local-offer" size={30} color={'gray'} />
                    </View>
                    <View style={{ width: width - 120, alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, paddingLeft: 10 }}>APPLY COUPON</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialIcons name="arrow-right" size={30} color={'gray'} />
                    </View>
                </TouchableOpacity>
        )
    }

    function getDate(date) {
        let d = date.split("T")[0]
        return d
    }

    function renderCouponModal() {
        const renderItem = ({ item }) => (
            <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: '83%', justifyContent: 'center', height: 30 }}>
                        <View
                            style={{
                                height: 30,
                                width: '40%',
                                backgroundColor: '#FC6D3F',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginVertical: 10
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 12 }}>{item.code}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{ justifyContent: 'center', borderWidth: 0.5, borderRadius: 5, padding: 5, borderColor: 'green' }}
                        onPress={() => {
                            setCouponModal(false)
                            setCouponApplied(item)
                            calcBill(cartItems, ASItems, item, mode)
                        }}
                    >
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12, color: 'green' }}>APPLY</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Get</Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}> {item.discount}%</Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}> off upto {'\u20B9'}{item.maxDiscount},</Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}> Valid Till : </Text>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{getDate(item.validTill)}</Text>
                </View>
                {item.description == "" ?
                    null :
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'gray' }}>{item.description}</Text>
                }
                <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', marginVertical: 10 }}></View>
            </View>
        );

        return (
            <Modal
                isVisible={couponModal}
                onBackdropPress={() => setCouponModal(false)}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    backgroundColor: "white",
                    alignItems: "flex-start",
                    borderRadius: 10,
                    maxHeight: 500,
                    width: width * 0.8,
                    paddingVertical: 10
                }}>
                    <View style={{ marginBottom: 10, width: '100%' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, marginLeft: 10, marginBottom: 10 }}>Select the Coupon</Text>
                        <View style={{
                            borderStyle: 'solid',
                            borderWidth: 1,
                            borderColor: '#F5F5F6',
                        }}></View>
                    </View>
                    <FlatList
                        data={coupons}
                        keyExtractor={item => `${item.id}`}
                        renderItem={renderItem}
                        contentContainerStyle={{
                            paddingHorizontal: 10,
                        }}
                    />
                </View>
            </Modal>
        )
    }

    function renderModeSelect() {
        return (
            kitchen?.mode == "Delivery" ?
                <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold' }}>Select Mode</Text>
                    <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                        <RadioButton
                            value="PickUp"
                            status={mode === 'PickUp' ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setMode('PickUp')
                                calcBill(cartItems, ASItems, couponApplied, 'PickUp')
                            }}
                        />
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginRight: 50, marginLeft: 10 }}>Pick Up</Text>
                        <RadioButton
                            value="Delivery"
                            status={mode === 'Delivery' ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setMode('Delivery')
                                calcBill(cartItems, ASItems, couponApplied, 'Delivery')
                            }}
                        />
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginLeft: 10 }}>Delivery</Text>
                    </View>
                </View>
                :
                <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                    <Text>You need to PickUp the order.</Text>
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
                        {kitDiscount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Kitchen Discount</Text>
                            : null
                        }
                        {couponApplied ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Coupon Discount</Text>
                            : null
                        }
                        {mode == "Delivery" ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Delivery Charge</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>Total Amount</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{'\u20B9'}{subTotal}</Text>
                        {kitDiscount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'green' }}>- {'\u20B9'}{kitDiscount}</Text>
                            : null
                        }
                        {couponApplied ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'green' }}>- {'\u20B9'}{couponDiscount}</Text>
                            : null
                        }
                        {mode == "Delivery" ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>{'\u20B9'}{kitchen.deliveryCharge}</Text>
                            : null
                        }
                        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#F5F5F6', width: '100%', marginVertical: 10 }}></View>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>{'\u20B9'}{toPay}.00</Text>
                    </View>
                </View>
            </View>
        )
    }

    function renderAddresses() {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 20, width: width * 0.8 }}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold', width: width*0.6 }}>Choose Your Address</Text>
                    <Pressable 
                        style={{alignItems: 'center'}}
                        onPress={() =>  {
                            removeItemValue("tempRegion")
                            navigation.navigate("AddNewAddress")
                        }}
                    >
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: '#FC6D3F' }} >Add New Address</Text>
                    </Pressable>
                </View>
                <View style={{ marginTop: 10 }}>
                    {addresses?.map((add) => {
                        return (
                            <View style={{ flexDirection: 'row', marginVertical: 10 }} key={add.id}>
                                <RadioButton
                                    color={'red'}
                                    value={add.place}
                                    status={selectedAddress?.id === add.id ? 'checked' : 'unchecked'}
                                    onPress={() => {
                                        setSelectedAddress(add)
                                    }}
                                />
                                <View>
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginLeft: 10 }}>{add.place}</Text>
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginLeft: 10, color: 'gray' }}>{add.address}, Floor No: {add.floorNo}</Text>
                                </View>
                            </View>
                        )
                    })}
                </View>
            </View>
        )
    }

    function renderAdvanceOrderCheckbox() {
        const onChange = (event, selecteddate) => {
            const d = selecteddate || selectedDate;
            if(d < new Date()){
                alert('Incorrect Time selected')
            } else {
                setDateTimePicker(false);
                setSelectedDate(d);
            }
        };

        const showDatepicker = () => {
            setDateTimePicker(true);
            setDateMode('date');
        };

        const showTimepicker = () => {
            setDateTimePicker(true);
            setDateMode('time');
        };

        return (
            <View style={{ marginHorizontal: 30, marginVertical: 20 }}>
                <View style={{ flexDirection: 'row' }}>
                    <BouncyCheckbox
                        size={25}
                        fillColor="green"
                        unfillColor="#FFFFFF"
                        iconStyle={{ borderColor: "green" }}
                        onPress={() => setAdvanceOrder(!advanceOrder)}
                    />
                    {advanceOrder ?
                        <View style={{flexDirection: 'row'}}>
                            <Pressable
                                style={{ marginLeft: 30 }}
                                onPress={showDatepicker}
                            >
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, color: '#FC6D3F' }}>Select Date</Text>
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, alignSelf: 'center' }}>{selectedDate.getDate()}/{selectedDate.getMonth()}/{selectedDate.getFullYear()}</Text>
                            </Pressable>
                            <Pressable
                                style={{ marginLeft: 30 }}
                                onPress={showTimepicker}
                            >
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, color: '#FC6D3F' }}>Select Time</Text>
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, alignSelf: 'center' }}>{selectedDate.getHours()}:{selectedDate.getMinutes()}</Text>
                            </Pressable>
                        </View>
                        :
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginLeft: 10 }}>Schedule Order?</Text>
                    }
                </View>
                {dateTimePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={selectedDate}
                        mode={dateMode}
                        display="default"
                        onChange={onChange}
                        minimumDate={minDate}
                        maximumDate={maxDate}
                    />
                )}
            </View>
        )
    }

    function renderFooter() {
        return (
            <View style={{ borderStyle: 'solid', borderWidth: orderButtonRaise? 110 : 80, borderColor: '#F5F5F6', width: width }}></View>
        )
    }

    function renderEmptyCart() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: width*0.8, alignSelf: 'center'}}>
                <MaterialIcons name="fastfood" size={250} color={'lightgray'} />
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, color: 'lightgray', marginTop: 20 }}>Your cart is Empty</Text>
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, color: 'lightgray' }}>Add your favourite food to order.</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {cartEmpty ?
                renderEmptyCart()
                :
                <View>
                    <ScrollView>
                        {renderCartItems()}
                        {renderMessageTextbox()}
                        {renderGap()}
                        {renderCoupons()}
                        {renderGap()}
                        {renderModeSelect()}
                        {renderGap()}
                        {renderBillingDetails()}
                        {renderGap()}
                        {loggedIn ?
                            <View>
                                {renderAddresses()}
                                {renderGap()}
                            </View>
                            :
                            null
                        }
                        {renderAdvanceOrderCheckbox()}
                        {renderFooter()}
                    </ScrollView>
                    {renderOrderButton()}
                    {renderRemoveItemModal()}
                    {renderCouponModal()}
                </View>
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

export default Cart;