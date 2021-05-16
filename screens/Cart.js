import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    Animated,
    Dimensions,
    FlatList,
    Button,
    Pressable,
    Switch,
    SectionList,
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

const Cart = ({ route, navigation }) => {

    const [kitchen, setKitchen] = React.useState(null);
    const [cartItems, setCartItems] = React.useState(null);
    const [ASItems, setASItems] = React.useState([]);
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

    React.useEffect(() => {
        AsyncStorage.getItem("kitchen").then((value) => {
            fetchCartData(value)
        });
    }, [])

    function fetchCartData(kitId) {
        AsyncStorage.getItem("orderItems").then((value) => JSON.parse(value))
            .then((items) => {
                setASItems(items)
                fetch(config.url + '/userapi/appcart', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "kitId": kitId,
                        "cartItems": items
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setKitchen(json.kitchen)
                        setCartItems(json.items)
                        setAddresses(json.addresses)
                        setCoupons(json.kitCoupons)
                        calcBill(json.items, items, couponApplied, mode)
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
        asitems?.map(item => {
            let cartitem = cartitems?.filter(a => a.id == item.itemId)[0]
            if (cartitem) {
                subtotal = subtotal + (cartitem.price * item.qty)
                kitdiscount = kitdiscount + ((cartitem.offer / 100 * cartitem.price) * item.qty)
            }
        })
        if (coupon) {
            coupondisc = (subtotal - kitdiscount) * coupon.discount / 100
            if (coupondisc > coupon.maxDiscount) {
                coupondisc = coupon.maxDiscount
            }
        }
        total = subtotal - kitdiscount - coupondisc
        if (mode == "Delivery") {
            total = total + kitchen.deliveryCharge
        }
        setSubTotal(subtotal);
        setKitDiscount(kitdiscount);
        setCouponDiscount(coupondisc);
        setToPay(Math.round(total));
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
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    borderColor: 'lightgray',
                    borderTopWidth: 0.5,
                    backgroundColor: 'white'
                }}
            >
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
                    <Text style={{ color: 'white', fontSize: 16 }}>Place Order</Text>
                </TouchableOpacity>
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
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <View style={{
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 35,
                        alignItems: "center",
                    }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>Items already in the cart will be removed. Do you wish to continue?</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Pressable
                                // style={[styles.button, styles.buttonClose]}
                                onPress={() => setRemoveItemModal(!removeItemModal)}
                            >
                                <Text >No</Text>
                            </Pressable>
                            <Pressable
                                // style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    setRemoveItemModal(!removeItemModal)
                                    subtractQty(tempSelectedItem, true)
                                }}
                            >
                                <Text >Yes</Text>
                            </Pressable>
                        </View>
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
                                                }}
                                            /> :
                                            <Image
                                                source={nonveg}
                                                style={{
                                                    width: 17,
                                                    height: 17,
                                                }}
                                            />}
                                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, marginLeft: 5, lineHeight: 18 }}>{item.name}</Text>
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
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', alignSelf: 'center', marginLeft: 10 }}>{'\u20B9'} {getTotalCost(item.price, getOrderQty(item.id))}</Text>
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
                <View style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}>
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
                    style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                    onPress={() =>
                        setCouponModal(true)}
                >
                    <View style={{ width: 50, alignItems: 'center' }}>
                        <MaterialIcons name="local-offer" size={30} color={'gray'} />
                    </View>
                    <View style={{ width: width - 120, alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, paddingLeft: 10 }}>APPLY COUPON</Text>
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
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold' }}>Billing Details</Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ width: width * 0.75 }}>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Sub-Total</Text>
                        {kitDiscount > 0 ?
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Kitchen Discount</Text>
                            : null
                        }
                        {couponDiscount > 0 ?
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
                        {couponDiscount > 0 ?
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
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                <Text>sdfjgruikgt</Text>
            </View>
        )
    }

    function renderFooter() {
        return (
            <View style={{ borderStyle: 'solid', borderWidth: 80, borderColor: '#F5F5F6', width: width }}></View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
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
                {renderAddresses()}
                {renderFooter()}
            </ScrollView>
            {renderOrderButton()}
            {renderRemoveItemModal()}
            {renderCouponModal()}
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