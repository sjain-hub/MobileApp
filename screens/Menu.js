import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    Switch,
    SectionList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform
} from "react-native";
// import { TouchableOpacity} from 'react-native-gesture-handler'
import Modal from 'react-native-modal';
const { width, height } = Dimensions.get("window");
import AsyncStorage from '@react-native-async-storage/async-storage';
import back from "../assets/icons/back.png";
import veg from "../assets/icons/veg.png";
import nonveg from "../assets/icons/nonveg.png";
import config from '../config.json';
import AntIcon from 'react-native-vector-icons/AntDesign';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FAIcon5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';


const Menu = ({ route, navigation }) => {

    const [kitchen, setKitchen] = React.useState(null);
    const [cartKitchenId, setCartKitchenId] = React.useState(null);
    const [categories, setCategories] = React.useState(null);
    const [menu, setMenu] = React.useState([]);
    const [sectionListData, setSectionListData] = React.useState([]);
    const [reviews, setReviews] = React.useState(null);
    const [orderItems, setOrderItems] = React.useState([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [searchPressed, setSearchPressed] = React.useState(false);
    const [subItemsModal, setSubItemsModal] = React.useState(false);
    const [categoryModal, setCategoryModal] = React.useState(false);
    const [minOrderError, setMinOrderError] = React.useState(false);
    const [tempSelectedItem, setTempSelectedItem] = React.useState([]);
    const [vegSelected, setVegSelected] = React.useState(false);
    const [sectionListRef, setSectionListRef] = React.useState();
    const [totalCartItems, setTotalCartItems] = React.useState(0);
    const [favourite, setFavourite] = React.useState();
    const [loading, setLoading] = React.useState(true)
    const [normalHeaderVisible, setNormalHeaderVisible] = React.useState(false)


    const scrollY = new Animated.Value(0)
    const translateY = scrollY.interpolate({
        inputRange: [0, 240],
        outputRange: [0, -240]
    })

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            let { kitId } = route.params;
            AsyncStorage.getItem("authToken").then((value) => {
                getKitchen(kitId, value)
            });

            AsyncStorage.getItem("kitchen").then((value) => {
                setCartKitchenId(value)
            });

            AsyncStorage.getItem("orderItems").then((value) => {
                if (value != null) {
                    countOrderItems(JSON.parse(value))
                    setOrderItems(JSON.parse(value))
                }
            });
        });
        return unsubscribe;
    }, [navigation]);

    function getKitchen(kitId, token) {
        AsyncStorage.getItem("region").then((value) => JSON.parse(value))
            .then((json) => {
                fetch(config.url + '/userapi/appgetKitchen', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: token ? 'Token ' + token : ''
                    },
                    body: JSON.stringify({
                        "lon": json.longitude,
                        "lat": json.latitude,
                        "kitId": kitId
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        if (json.kit_object) {
                            fetchMenu(json.kit_object)
                            setKitchen(json.kit_object)
                            setFavourite(json.kit_object.favourite)
                        }
                    }).catch((error) => {
                        if (error == 'TypeError: Network request failed') {
                            navigation.navigate("NoInternet")
                        } else {
                            console.error(error)
                        }
                    });
            });
    }

    function countOrderItems(items) {
        let count = 0
        items.map(item => {
            count = count + item.qty
        })
        setTotalCartItems(count)
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

    function checkCart(action, itemId) {
        let selectedItem = menu.filter(b => b.id == itemId)
        setTempSelectedItem(selectedItem[0])
        if (cartKitchenId == null) {
            setCartKitchenId(kitchen.id)
            AsyncStorage.setItem('kitchen', '' + kitchen.id)
            if (selectedItem[0].subitems.length > 0) {
                setSubItemsModal(true)
            } else {
                editOrder(action, itemId)
            }
        } else {
            if (cartKitchenId == kitchen.id) {
                if (selectedItem[0].subitems.length > 0) {
                    setSubItemsModal(true)
                } else {
                    editOrder(action, itemId)
                }
            } else {
                setModalVisible(true)
            }
        }
    }

    function editOrder(action, itemId) {
        let orderItemId = 0
        if (typeof itemId == 'string') {
            orderItemId = parseInt(itemId.split('-')[0])
        } else {
            orderItemId = itemId
        }
        setMinOrderError(false)
        let orderList = orderItems.slice()
        let orderitem = orderList.filter(a => a.itemId == itemId)
        let menuitem = menu.filter(b => b.id == orderItemId)[0]
        if (action == "+") {
            if (orderitem.length > 0) {
                let newQty = 0
                if (menuitem.minOrder > 0 && orderitem[0].qty == 0 && menuitem.subitems.length == 0) {
                    newQty = orderitem[0].qty + menuitem.minOrder
                } else {
                    newQty = orderitem[0].qty + 1
                }
                setTotalCartItems(totalCartItems - orderitem[0].qty + newQty)
                orderitem[0].qty = newQty
            } else {
                const newItem = {
                    itemId: itemId,
                    qty: menuitem.minOrder > 0 && menuitem.subitems.length == 0 ? menuitem.minOrder : 1,
                }
                setTotalCartItems(totalCartItems + newItem.qty)
                orderList.push(newItem)
            }
            setOrderItems(orderList)
            AsyncStorage.setItem('orderItems', JSON.stringify(orderList))
        } else {
            if (orderitem.length > 0) {
                if (orderitem[0]?.qty > 0) {
                    let newQty = 0
                    if (menuitem.minOrder > 0 && orderitem[0].qty == menuitem.minOrder && menuitem.subitems.length == 0) {
                        newQty = 0
                    } else {
                        newQty = orderitem[0].qty - 1
                    }
                    setTotalCartItems(totalCartItems - orderitem[0].qty + newQty)
                    if (totalCartItems - orderitem[0].qty + newQty == 0) {
                        removeItemValue('orderItems')
                        removeItemValue('kitchen')
                        setCartKitchenId(null)
                    }
                    orderitem[0].qty = newQty
                }
            }

            setOrderItems(orderList)
            AsyncStorage.setItem('orderItems', JSON.stringify(orderList))
        }
    }

    async function editOrderAfterKitchenChange() {
        setCartKitchenId(kitchen.id)
        AsyncStorage.setItem('kitchen', '' + kitchen.id)
        let orderList = []
        if (tempSelectedItem.subitems.length > 0) {
            setTotalCartItems(0)
            setSubItemsModal(true)
        } else {
            const newItem = {
                itemId: tempSelectedItem.id,
                qty: tempSelectedItem.minOrder > 0 ? tempSelectedItem.minOrder : 1,
            }
            setTotalCartItems(newItem.qty)
            orderList.push(newItem)
        }
        setOrderItems(orderList)
        AsyncStorage.setItem('orderItems', JSON.stringify(orderList))
    }

    function checkMinQty() {
        let qty = getOrderQty(tempSelectedItem.id + '-')
        if (qty < tempSelectedItem.minOrder && qty != 0) {
            setMinOrderError(true)
        } else {
            setMinOrderError(false)
            setSubItemsModal(!subItemsModal)
        }
    }

    function getOrderQty(itemId) {
        let orderItem = []
        if (typeof itemId == 'string') {
            orderItem = orderItems.filter(a => {
                if (typeof a.itemId == 'string' && (a.itemId == itemId || a.itemId.includes(itemId))) {
                    return true;
                } else {
                    return false;
                }
            })
        } else {
            orderItem = orderItems.filter(a => a.itemId == itemId)
        }

        if (orderItem.length > 0) {
            let qty = 0
            orderItem.map((item) => {
                qty = qty + item.qty
            })
            return qty
        }
        return 0


        // let orderItem = orderItems.filter(a => a.itemId == itemId)
        // if (orderItem.length > 0) {
        //     return orderItem[0].qty
        // }
        // return 0
    }

    function fetchMenu(item) {
        fetch(config.url + '/userapi/appmenu', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "kitId": item.id
            })
        }).then((response) => response.json())
            .then((json) => {
                setLoading(false)
                setCategories(json.categories)
                setMenu(json.menuitems)
                makeSectionList(json.menuitems, json.categories)
                setReviews(json.reviews)
            }).catch((error) => {
                if (error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")
                } else {
                    console.error(error)
                }
            });
    }

    function makeSectionList(items, cats) {

        let sections = []
        cats.map(cat => {
            items.map(item => {
                if (cat.category == item.category) {
                    let section = sections.find(section => section.category === item.category);

                    if (!section) {
                        section = { category: item.category, data: [] };
                        sections.push(section);
                    }
                    section.data.push(item);
                }

            })
        })
        setSectionListData(sections)
    }

    function renderHeader() {
        return (
            searchPressed ?
                renderSearch()
                :
                normalHeaderVisible? <View style={{ flexDirection: 'row', width: width }}>
                    <TouchableOpacity
                        style={{
                            width: 50,
                            paddingLeft: 20,
                            justifyContent: 'center',
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
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <View
                            style={{
                                height: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 30,
                                borderRadius: 30,
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 20, lineHeight: 22 }}>{kitchen?.kitName}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            paddingRight: 20,
                            justifyContent: 'center'
                        }}
                        onPress={() => setSearchPressed(true)}
                    >
                        <Ionicons name="search" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            width: 50,
                            paddingRight: 20,
                            justifyContent: 'center'
                        }}
                        onPress={() => setCategoryModal(true)}
                    >
                        <Entypo name="menu" size={26} />
                    </TouchableOpacity>
                </View>
                :
                null
        )
    }

    function renderSearch() {
        const showSearchResults = (text) => {
            let searcheditems = menu.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            )
            makeSectionList(searcheditems, categories)
        }

        const backPress = () => {
            setSearchPressed(false)
            makeSectionList(menu, categories)
        }

        return (
            <View style={{ flexDirection: 'row', width: width }}>
                <TouchableOpacity
                    style={{
                        width: 50,
                        paddingLeft: 20,
                        justifyContent: 'center',
                    }}
                    onPress={() => backPress()}
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
                        flex: 1,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}
                >
                    <View
                        style={{
                            height: 50,
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingHorizontal: 30,
                            backgroundColor: '#F5F5F6',
                            width: width - 50,
                        }}
                    >
                        <TextInput
                            style={{ fontFamily: "System", fontSize: 20, lineHeight: 22, width: '100%' }}
                            onChangeText={(text) => showSearchResults(text)}
                            placeholder="Search"
                        >
                        </TextInput>
                    </View>
                </View>
            </View>
        )
    }

    function renderAnimatedHeader() {
        const filterVegItems = () => {
            setVegSelected(!vegSelected)
            if (!vegSelected) {
                let filtereditems = menu.filter(item =>
                    item.type == 'veg'
                )
                makeSectionList(filtereditems, categories)
            }
            else {
                makeSectionList(menu, categories)
            }
        }

        return (
            searchPressed ?
                null
                :
                <View>
                    <View
                        style={{
                            backgroundColor: 'white',
                            height: 250,
                        }}
                    >
                        <Image
                            source={{ uri: config.url + kitchen?.dp }}
                            resizeMode="stretch"
                            style={{
                                width: width,
                                height: 200,
                                borderBottomLeftRadius: 30,
                                borderBottomRightRadius: 30,
                            }}
                        />
                        <View
                            style={{
                                top: - 150,
                                width: width * 0.9,
                                height: 180,
                                backgroundColor: 'white',
                                borderRadius: 40,
                                alignSelf: 'center',
                                padding: 20,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 3,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 4,
                                elevation: 10,
                            }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ marginBottom: 5, width: '85%' }}
                                    activeOpacity={0.5}
                                    onPress={() => navigation.navigate("KitchenDetails", {
                                        kitchen: kitchen,
                                        reviews: reviews
                                    })}
                                >
                                    <Text style={{ fontFamily: "System", fontSize: 22, fontWeight: 'bold' }}>{kitchen?.kitName} <AntIcon name="right" size={22} /></Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => markFavourite(kitchen.id)}
                                >
                                    <AntIcon name={favourite ? "heart" : "hearto"} size={22} color="red" />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ fontFamily: "System", fontSize: 13, color: 'gray', marginBottom: 5 }}>{kitchen?.catdesc}</Text>
                            <Text style={{ fontFamily: "System", fontSize: 13, color: 'gray', marginBottom: 5 }}>{kitchen?.landmark}</Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginBottom: 10,
                                }}
                            >
                                {kitchen?.avgrating ?
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}
                                        onPress={() => navigation.navigate("KitchenDetails", {
                                            kitchen: kitchen,
                                            reviews: reviews,
                                            scrollToReviews: true
                                        })}
                                    >
                                        <FAIcon name="star" size={16} color={(kitchen?.avgrating >= 4) ? "green" : (kitchen?.avgrating >= 3) ? "gold" : "red"} />
                                        <Text style={{ fontFamily: "System", fontSize: 14 }}> {kitchen?.avgrating} <Text style={{ fontFamily: "System", fontSize: 14 }}>({reviews?.length} Reviews)<AntIcon name="right" size={12} /></Text> | </Text>
                                    </TouchableOpacity>
                                    : null}
                                <Text style={{ fontFamily: "System", fontSize: 14 }}>{kitchen?.dist} km | </Text>
                                <Text style={{ fontFamily: "System", fontSize: 14 }}>{kitchen?.mode} ({kitchen?.deliveryTime} min)</Text>
                            </View>
                            {!kitchen?.pureVeg ?
                                <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: "System", fontSize: 15, alignSelf: 'center' }}>Veg Only</Text>
                                    <Switch
                                        trackColor={{ false: "#767577", true: "lightgreen" }}
                                        thumbColor={vegSelected ? "#228B22" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => filterVegItems()}
                                        value={vegSelected}
                                        style={Platform.OS == "ios" ?
                                            { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }], marginLeft: 10 }
                                            :
                                            { transform: [{ scaleX: 1 }, { scaleY: 1 }], marginLeft: 10 }}
                                    />
                                </View>
                                :
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: "System", fontSize: 15, marginRight: 5 }}>Pure Veg</Text>
                                    <FAIcon5 name="leaf" size={18} color="green" />
                                </View>
                            }
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', width: width, backgroundColor: 'white', paddingVertical: 10 }}>
                        <TouchableOpacity
                            style={{
                                width: 50,
                                paddingLeft: 20,
                                justifyContent: 'center',
                                marginRight: width * 0.64
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

                        <TouchableOpacity
                            style={{
                                paddingRight: 20,
                                justifyContent: 'center'
                            }}
                            onPress={() => setSearchPressed(true)}
                        >
                            <Ionicons name="search" size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                paddingRight: 20,
                                justifyContent: 'center'
                            }}
                            onPress={() => setCategoryModal(true)}
                        >
                            <Entypo name="menu" size={26} />
                        </TouchableOpacity>

                    </View>
                </View>
                // <Animated.View
                //     style={{
                //         zIndex: 1,
                //         position: 'absolute',
                //         transform: [
                //             { translateY: translateY }
                //         ],
                //         // ...styles.shadow
                //     }}
                // >
                //     <View
                //         style={{
                //             backgroundColor: 'white',
                //             height: 250,
                //         }}
                //     >
                //         <Image
                //             source={{ uri: config.url + kitchen?.dp }}
                //             resizeMode="stretch"
                //             style={{
                //                 width: width,
                //                 height: 200,
                //                 borderBottomLeftRadius: 30,
                //                 borderBottomRightRadius: 30,
                //             }}
                //         />
                //         <View
                //             style={{
                //                 top: - 150,
                //                 width: width * 0.9,
                //                 height: 180,
                //                 backgroundColor: 'white',
                //                 borderRadius: 40,
                //                 alignSelf: 'center',
                //                 padding: 20,
                //                 shadowColor: "#000",
                //                 shadowOffset: {
                //                     width: 0,
                //                     height: 3,
                //                 },
                //                 shadowOpacity: 0.25,
                //                 shadowRadius: 4,
                //                 elevation: 50,
                //             }}
                //         >
                //             <View style={{ flexDirection: 'row' }}>
                //                 <TouchableOpacity
                //                     style={{ marginBottom: 5, width: '85%' }}
                //                     activeOpacity={0.5}
                //                     onPress={() => navigation.navigate("KitchenDetails", {
                //                         kitchen: kitchen,
                //                         reviews: reviews
                //                     })}
                //                 >
                //                     <Text style={{ fontFamily: "System", fontSize: 22, fontWeight: 'bold' }}>{kitchen?.kitName} <AntIcon name="right" size={22} /></Text>
                //                 </TouchableOpacity>
                //                 <TouchableOpacity
                //                     onPress={() => markFavourite(kitchen.id)}
                //                 >
                //                     <AntIcon name={favourite ? "heart" : "hearto"} size={22} color="red" />
                //                 </TouchableOpacity>
                //             </View>
                //             <Text style={{ fontFamily: "System", fontSize: 13, color: 'gray', marginBottom: 5 }}>{kitchen?.catdesc}</Text>
                //             <Text style={{ fontFamily: "System", fontSize: 13, color: 'gray', marginBottom: 5 }}>{kitchen?.landmark}</Text>
                //             <View
                //                 style={{
                //                     flexDirection: 'row',
                //                     marginBottom: 10,
                //                 }}
                //             >
                //                 {kitchen?.avgrating ?
                //                     <TouchableOpacity
                //                         style={{
                //                             flexDirection: 'row'
                //                         }}
                //                         onPress={() => navigation.navigate("KitchenDetails", {
                //                             kitchen: kitchen,
                //                             reviews: reviews,
                //                             scrollToReviews: true
                //                         })}
                //                     >
                //                         <Image
                //                             source={Star}
                //                             style={{
                //                                 marginTop: 2,
                //                                 height: 14,
                //                                 width: 14,
                //                                 tintColor: (kitchen?.avgrating >= 4) ? "green" : (kitchen?.avgrating >= 3) ? "gold" : "red",
                //                             }}
                //                         />
                //                         <Text style={{ fontFamily: "System", fontSize: 14 }}> {kitchen?.avgrating} <Text style={{ fontFamily: "System", fontSize: 14 }}>({reviews?.length} Reviews)<AntIcon name="right" size={12} /></Text>  |  </Text>
                //                     </TouchableOpacity>
                //                     : null}
                //                 <Text style={{ fontFamily: "System", fontSize: 14 }}>{kitchen?.dist} km  |  </Text>
                //                 <Text style={{ fontFamily: "System", fontSize: 14 }}>{kitchen?.mode} ({kitchen?.deliveryTime} min)</Text>
                //             </View>
                //             {!kitchen?.pureVeg ?
                //                 <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
                //                     <Text style={{ fontFamily: "System", fontSize: 15, alignSelf: 'center'}}>Veg Only</Text>
                //                     <Switch
                //                         trackColor={{ false: "#767577", true: "lightgreen" }}
                //                         thumbColor={vegSelected ? "#228B22" : "#f4f3f4"}
                //                         ios_backgroundColor="#3e3e3e"
                //                         onValueChange={() => filterVegItems()}
                //                         value={vegSelected}
                //                         style={Platform.OS == "ios" ?
                //                             { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }], marginLeft: 10}
                //                             :
                //                             { transform: [{ scaleX: 1 }, { scaleY: 1 }], marginLeft: 10 }}
                //                     />
                //                 </View>
                //                 :
                //                 <View style={{ flexDirection: 'row' }}>
                //                     <Text style={{ fontFamily: "System", fontSize: 15, marginRight: 5 }}>Pure Veg</Text>
                //                     <FAIcon5 name="leaf" size={18} color="green" />
                //                 </View>
                //             }
                //         </View>
                //     </View>
                // </Animated.View>
        )
    }

    function markFavourite(kitId) {
        AsyncStorage.getItem("authToken").then((value) => {
            if (value) {
                fetch(config.url + '/userapi/appaddToFavourite', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "kitId": kitId,
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setFavourite(!favourite)
                    }).catch((error) => {
                        if (error == 'TypeError: Network request failed') {
                            navigation.navigate("NoInternet")
                        } else {
                            console.error(error)
                        }
                    });
            }
            else {
                navigation.navigate("Account", {
                    cameFrom: true
                })
            }
        });
    }

    function renderMenu() {
        const renderCategories = (data) => (
            <View style={{ backgroundColor: 'white', paddingVertical: 10 }}>
                <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 10 }}>{data.section.category}</Text>
            </View>
        )

        const renderItem = ({ item }) => (
            <View style={{ marginBottom: 30, marginTop: 20, flexDirection: 'row', width: width, paddingHorizontal: 20 }}>
                <View style={{ width: width * 0.54, justifyContent: 'center', marginRight: 15 }}>
                    <Text style={{ fontFamily: "System", fontSize: 16, marginBottom: 5 }}>{item.name}</Text>
                    {item.type == "veg" ?
                        <Image
                            source={veg}
                            style={{
                                width: 19,
                                height: 19,
                            }}
                        /> :
                        <Image
                            source={nonveg}
                            style={{
                                width: 20,
                                height: 20,
                            }}
                        />}

                    <Text style={{ fontFamily: "System", fontSize: 14, color: "gray" }}>{item.desc}</Text>

                    {item.minOrder > 0 ?
                        <Text style={{ fontFamily: "System", fontSize: 14, color: "gray" }}>Minimum Order: {item.minOrder}</Text>
                        : null}

                    {item.condition ?
                        <Text style={{ fontFamily: "System", fontSize: 14, color: "red" }}>{item.condition}</Text>
                        : null}

                    {item.offer > 0 ?
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>{'\u20B9'} {item.discountrate}</Text>
                            <Text style={{ fontFamily: "System", fontSize: 16, color: 'gray', textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 10 }}>{'\u20B9'} {item.price}</Text>
                            <Text style={{ fontFamily: "System", fontSize: 14, marginLeft: 8, backgroundColor: 'green', color: 'white', paddingLeft: 3, paddingRight: 3 }}>{item.offer}% off</Text>
                        </View>
                        : <Text style={{ fontFamily: "System", fontSize: 16, marginTop: 10 }}>{'\u20B9'} {item.price}</Text>
                    }
                </View>
                <View style={{ height: 130, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        source={{ uri: config.url + item.image }}
                        resizeMode="cover"
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: 100,
                            opacity: kitchen.status == 'Closed' || item.out_of_stock ? 0.5 : 1
                        }}
                    />
                    {item.out_of_stock ?
                        <View
                            style={{
                                position: 'absolute',
                                top: 45,
                                height: 30,
                                width: 120,
                                borderRadius: 2,
                                backgroundColor: 'white',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 20,
                                ...styles.shadow
                            }}>
                            <Text style={{ fontFamily: "System", fontSize: 12, fontWeight: 'bold', color: 'gray' }}>OUT OF STOCK</Text>
                        </View>
                        :
                        null
                    }
                    <View
                        style={{
                            position: 'absolute',
                            bottom: -8,
                            width: width * 0.3,
                            height: 35,
                            justifyContent: 'center',
                            flexDirection: 'row',
                            borderRadius: 25,
                            backgroundColor: 'white',
                            ...styles.shadow
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                width: 35,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderTopLeftRadius: 25,
                                borderBottomLeftRadius: 25,
                            }}
                            activeOpacity={0.9}
                            disabled={kitchen.status == 'Closed' || item.out_of_stock || getOrderQty(item.subitems.length > 0 ? item.id + '-' : item.id) == 0}
                            onPress={() => checkCart("-", item.id)}
                        >
                            <Entypo name="minus" size={16} color={kitchen.status == 'Closed' || item.out_of_stock ? 'gray' : 'green'} />
                        </TouchableOpacity>

                        <View
                            style={{
                                width: 35,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 14, lineHeight: 25, color: kitchen.status == 'Closed' || item.out_of_stock ? 'gray' : 'green' }}>{getOrderQty(item.subitems.length > 0 ? item.id + '-' : item.id)}</Text>
                        </View>

                        <TouchableOpacity
                            style={{
                                width: 35,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderTopRightRadius: 25,
                                borderBottomRightRadius: 25,
                            }}
                            activeOpacity={0.9}
                            disabled={kitchen.status == 'Closed' || item.out_of_stock}
                            onPress={() => checkCart("+", item.id)}
                        >
                            <Entypo name="plus" size={16} color={kitchen.status == 'Closed' || item.out_of_stock ? 'gray' : 'green'} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )

        const separator = () => (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: '#F5F5F6',
            }}></View>
        )

        const sectionFooter = () => (
            <View style={{
                borderWidth: 5,
                borderColor: '#F5F5F6',
            }}></View>
        )

        const Header = () => (
            searchPressed ?
                null
                :
                renderAnimatedHeader()
        )

        const footer = () => (
            searchPressed ?
                null
                :
                <View style={{ backgroundColor: '#F5F5F6', height: 300, padding: 20 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontStyle: 'italic', marginRight: 10, color: 'gray', fontSize: 18 }}>FSSAI License No.</Text>
                        <Text style={{ fontSize: 18 }}>{kitchen?.fssaiLicNo}</Text>
                    </View>
                </View>
        )

        const getItemLayout = (data, index) => ({
            length: 150,
            offset: 150 * index,
            index,
        })

        return (
            <SectionList
                sections={sectionListData}
                renderSectionHeader={
                    renderCategories
                }
                renderItem={
                    renderItem
                }
                onScroll={(e) => {
                    scrollY.setValue(e.nativeEvent.contentOffset.y)
                    e.nativeEvent.contentOffset.y > 280 ? setNormalHeaderVisible(true) : setNormalHeaderVisible(false)
                }}
                ItemSeparatorComponent={separator}
                renderSectionFooter={sectionFooter}
                keyExtractor={(item) => item.id}
                // contentContainerStyle={{
                //     paddingTop: 10
                // }}
                ListHeaderComponent={Header}
                ListFooterComponent={footer}
                ref={(ref) => setSectionListRef(ref)}
                getItemLayout={getItemLayout}
            />
        )
    }

    function renderKitSwitchModal() {
        return (
            <Modal
                isVisible={modalVisible}
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
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Items already in the cart will be removed. Do you wish to continue?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%' }}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>No</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setModalVisible(!modalVisible)
                                editOrderAfterKitchenChange()
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function renderCategoryModal() {
        const scrollToSection = (index) => {
            setCategoryModal(false)
            sectionListRef?.scrollToLocation({
                animated: true,
                sectionIndex: index,
                itemIndex: 0,
                viewPosition: 0,
                viewOffset: 0
            });
        };

        const renderItem = ({ item, index }) => (
            <View>
                <TouchableOpacity onPress={() => scrollToSection(index)} >
                    <Text style={{ fontSize: 18, padding: 15 }}>{item.category}</Text>
                </TouchableOpacity>
            </View>
        );

        return (
            <Modal
                isVisible={categoryModal}
                onBackdropPress={() => setCategoryModal(false)}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    backgroundColor: "white",
                    alignItems: "flex-start",
                    borderRadius: 10,
                    maxHeight: 300,
                    width: width * 0.6,
                    paddingTop: 10,
                    paddingBottom: 10
                }}>
                    <FlatList
                        data={categories}
                        keyExtractor={item => `${item.id}`}
                        renderItem={renderItem}
                        contentContainerStyle={{
                            paddingHorizontal: 30,
                            width: width * 0.55
                        }}
                    />
                </View>
            </Modal>
        )
    }

    function renderSubItemsModal() {
        return (
            <Modal
                isVisible={subItemsModal}
                onBackdropPress={() => {
                    tempSelectedItem.minOrder > 0 ? checkMinQty() : setSubItemsModal(!subItemsModal)
                }}
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
                        paddingLeft: 35,
                        paddingRight: 35,
                        paddingTop: 30,
                        alignItems: "center",
                    }}>
                        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                            {tempSelectedItem.type == "veg" ?
                                <Image
                                    source={veg}
                                    style={{
                                        width: 18,
                                        height: 18,
                                    }}
                                /> :
                                <Image
                                    source={nonveg}
                                    style={{
                                        width: 19,
                                        height: 19,
                                    }}
                                />}
                            <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{tempSelectedItem.name}</Text>
                        </View>

                        {minOrderError ?
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontFamily: "System", fontSize: 14, color: 'red' }}>* Minimum Order Quantity : {tempSelectedItem.minOrder}</Text>
                            </View>
                            : null}

                        {tempSelectedItem.subitems?.map((subitem) => {
                            return (
                                <View key={subitem.id} style={{ marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', width: width * 0.7, marginBottom: 20, justifyContent: 'center' }}>
                                        <View style={{ alignItems: 'flex-start', width: '70%', justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: "System", fontSize: 16 }}>{subitem.name}</Text>
                                            {tempSelectedItem.offer > 0 ?
                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold' }}>{'\u20B9'} {subitem.discountrate}</Text>
                                                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 10 }}>{'\u20B9'} {subitem.price}</Text>
                                                    <Text style={{ fontFamily: "System", fontSize: 12, marginLeft: 8, backgroundColor: 'green', color: 'white', paddingLeft: 3, paddingRight: 3 }}>{tempSelectedItem.offer}% off</Text>
                                                </View>
                                                : <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>{'\u20B9'} {subitem.price}</Text>
                                            }
                                        </View>
                                        <View
                                            style={{
                                                width: width * 0.3,
                                                height: 35,
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                                alignSelf: 'center',
                                                backgroundColor: 'white',
                                                borderRadius: 25,
                                                ...styles.shadow
                                            }}
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    width: 35,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderTopLeftRadius: 25,
                                                    borderBottomLeftRadius: 25,
                                                }}
                                                activeOpacity={0.5}
                                                onPress={() => editOrder("-", tempSelectedItem.id + '-' + subitem.id)}
                                            >
                                                <Entypo name="minus" size={16} color={'green'} />
                                            </TouchableOpacity>

                                            <View
                                                style={{
                                                    width: 35,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text style={{ fontFamily: "System", fontSize: 14, lineHeight: 25, color: 'green' }}>{getOrderQty(tempSelectedItem?.id + '-' + subitem.id)}</Text>
                                            </View>

                                            <TouchableOpacity
                                                style={{
                                                    width: 35,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderTopRightRadius: 25,
                                                    borderBottomRightRadius: 25,
                                                }}
                                                activeOpacity={0.5}
                                                onPress={() => editOrder("+", tempSelectedItem.id + '-' + subitem.id)}
                                            >
                                                <Entypo name="plus" size={16} color={'green'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{
                                        borderStyle: 'dotted',
                                        borderWidth: 1,
                                        borderRadius: 1,
                                        borderColor: '#F5F5F6',
                                    }}>
                                    </View>
                                </View>
                            )
                        })}

                        <TouchableOpacity
                            style={{
                                width: width * 0.4,
                                height: 40,
                                backgroundColor: minOrderError ? 'lightgray' : 'green',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                                borderRadius: 30,
                                activeOpacity: 0.5,
                                ...styles.shadow
                            }}
                            disabled={minOrderError}
                            onPress={() => tempSelectedItem.minOrder > 0 ? checkMinQty() : setSubItemsModal(!subItemsModal)}
                        >
                            <Text style={{ color: "white", fontWeight: "bold", textAlign: "center", fontSize: 16 }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    function renderCart() {
        return (
            totalCartItems > 0 ?
                <View style={{ top: '90%', alignSelf: 'center', position: 'absolute' }}>
                    <TouchableOpacity
                        style={{ width: width * 0.4, height: 50, borderRadius: 30, backgroundColor: 'lightgreen', ...styles.shadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => navigation.navigate("Cart", {
                            raiseButton: false
                        })}
                    >
                        <FAIcon5 name="shopping-cart" size={22} color="green" />
                        <View style={{ width: 22, height: 22, borderRadius: 50, backgroundColor: '#FC6D3F', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'white' }}>{totalCartItems}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                : null
        )
    }

    function renderKitchenClosedTag() {
        return (
            totalCartItems > 0 ?
                <View style={{ top: '90%', alignSelf: 'center', position: 'absolute' }}>
                    <View
                        style={{ width: width * 0.4, height: 50, borderRadius: 30, backgroundColor: 'lightgray', ...styles.shadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold' }}>CLOSED</Text>
                    </View>
                </View>
                : null
        )
    }

    function renderLoader() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#FC6D3F" />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {
                loading ?
                    renderLoader()
                    :
                    <View style={{ flex: 1 }}>
                        {renderHeader()}
                        {renderMenu()}
                        {renderKitSwitchModal()}
                        {renderSubItemsModal()}
                        {renderCategoryModal()}
                        {kitchen.status == 'Closed' ? renderKitchenClosedTag() : renderCart()}
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
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }
})

export default Menu;