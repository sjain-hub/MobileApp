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
    Button,
    Pressable,
    Switch,
    SectionList,
    TouchableOpacity,
    TextInput
} from "react-native";
// import { TouchableOpacity} from 'react-native-gesture-handler'
import Modal from 'react-native-modal';
const { width, height } = Dimensions.get("window");
import { isIphoneX } from 'react-native-iphone-x-helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import back from "../assets/icons/back.png";
import list from "../assets/icons/list.png";
import veg from "../assets/icons/veg.png";
import nonveg from "../assets/icons/nonveg.png";
import config from '../config.json';
import Star from '../assets/icons/star.png';
import search from "../assets/icons/search.png";
import AntIcon from 'react-native-vector-icons/AntDesign';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';


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

    const scrollY = new Animated.Value(0)
    const translateY = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [0, -150]
    })

    React.useEffect(() => {
        let { item } = route.params;

        AsyncStorage.getItem("kitchen").then((value) => {
            setCartKitchenId(value)
        });

        AsyncStorage.getItem("orderItems").then((value) => {
            if (value != null) {
                countOrderItems(JSON.parse(value))
                setOrderItems(JSON.parse(value))
            }
        });

        fetchMenu(item)
        setKitchen(item)
    }, [])

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
                setCategories(json.categories)
                setMenu(json.menuitems)
                makeSectionList(json.menuitems, json.categories)
                setReviews(json.reviews)
            }).catch((error) => {
                console.error(error);
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
                <View style={{ flexDirection: 'row', width: width }}>
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
                            <Text style={{ fontFamily: "Roboto-Bold", fontSize: 20, lineHeight: 22 }}>{kitchen?.kitName}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            paddingRight: 20,
                            justifyContent: 'center'
                        }}
                        onPress={() => setSearchPressed(true)}
                    >
                        <Image
                            source={search}
                            resizeMode="contain"
                            style={{
                                width: 15,
                                height: 15
                            }}
                        />
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
                            style={{ fontFamily: "Roboto-Bold", fontSize: 20, lineHeight: 22, width: '100%' }}
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
                <Animated.View
                    style={{
                        zIndex: 1,
                        position: 'absolute',
                        transform: [
                            { translateY: translateY }
                        ],
                        ...styles.shadow
                    }}
                >
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
                                elevation: 50,
                            }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity 
                                    style={{ marginBottom: 5, width: '85%'}} 
                                    activeOpacity={0.5} 
                                    onPress={() => navigation.navigate("KitchenDetails", {
                                        kitchen: kitchen,
                                        reviews: reviews
                                    })}
                                >
                                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 22, fontWeight: 'bold' }}>{kitchen?.kitName} <AntIcon name="right" size={22} /></Text>
                                </TouchableOpacity>
                                <AntIcon name="hearto" size={22} color="red" />
                            </View>
                            <Text style={{ fontFamily: "Roboto-Bold", fontSize: 13, color: 'gray', marginBottom: 5 }}>{kitchen?.catdesc}</Text>
                            <Text style={{ fontFamily: "Roboto-Bold", fontSize: 13, color: 'gray', marginBottom: 5 }}>{kitchen?.landmark}</Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginBottom: 5,
                                }}
                            >
                                {kitchen?.ratings__avg != null ?
                                    <View style={{
                                        flexDirection: 'row'
                                    }}>
                                        <Image
                                            source={Star}
                                            style={{
                                                marginTop: 2,
                                                height: 16,
                                                width: 16,
                                                tintColor: (kitchen?.ratings__avg >= 4) ? "green" : (kitchen?.ratings__avg >= 3) ? "gold" : "red",
                                            }}
                                        />
                                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}> {kitchen?.ratings__avg}  <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}>({reviews?.length} Reviews)<AntIcon name="right" size={12} /></Text>  |  </Text>
                                    </View>
                                    : null}
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>{kitchen?.dist} km  |  </Text>
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>{kitchen?.mode} ({kitchen?.deliveryTime} min)</Text>
                            </View>
                            {!kitchen?.pureVeg ?
                                <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 15, }}>Veg Only</Text>
                                    <Switch
                                        trackColor={{ false: "#767577", true: "lightgreen" }}
                                        thumbColor={vegSelected ? "#228B22" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => filterVegItems()}
                                        value={vegSelected}
                                        style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }], marginLeft: 10 }}
                                    />
                                </View>
                                :
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 15, marginRight: 5 }}>Pure Veg</Text>
                                    <FAIcon name="leaf" size={18} color="green" />
                                </View>
                            }
                        </View>
                    </View>
                </Animated.View>
        )
    }

    function renderMenu() {
        const renderCategories = (data) => (
            <Text style={{ fontFamily: "Roboto-Black", fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 20 }}>{data.section.category}</Text>
        )

        const renderItem = ({ item }) => (
            <View style={{ marginBottom: 30, marginTop: 20, flexDirection: 'row', width: width, paddingHorizontal: 20 }}>
                <View style={{ width: width * 0.56, justifyContent: 'center', marginRight: 15 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, marginBottom: 5 }}>{item.name}</Text>
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

                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: "#C0C0C0" }}>{item.desc}</Text>

                    {item.minOrder > 0 ?
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: "#C0C0C0" }}>Minimum Order: {item.minOrder}</Text>
                        : null}

                    {item.condition ?
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: "red" }}>{item.condition}</Text>
                        : null}

                    {item.offer > 0 ?
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>{'\u20B9'} {item.discountrate}</Text>
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, color: 'gray', textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 10 }}>{'\u20B9'} {item.price}</Text>
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, marginLeft: 8, backgroundColor: 'green', color: 'white', paddingLeft: 3, paddingRight: 3 }}>{item.offer}% off</Text>
                        </View>
                        : <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, marginTop: 10 }}>{'\u20B9'} {item.price}</Text>
                    }

                    {item.out_of_stock ?
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, color: "gray", fontWeight: 'bold' }}>OUT OF STOCK</Text>
                        : null}

                </View>
                <View style={{ height: 130 }}>
                    {item.out_of_stock ?
                        <View>
                            <Image source={{ uri: config.url + item.image }}
                                resizeMode="cover"
                                style={{
                                    tintColor: 'gray',
                                    width: 120,
                                    height: 120,
                                    borderRadius: 100,
                                }} />
                            <Image source={{ uri: config.url + item.image }}
                                resizeMode="cover"
                                style={{
                                    position: 'absolute',
                                    opacity: 0.2,
                                    width: 120,
                                    height: 120,
                                    borderRadius: 100,
                                }} />
                        </View>
                        :
                        <Image
                            source={{ uri: config.url + item.image }}
                            resizeMode="cover"
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 100,
                            }}
                        />
                    }
                    {/* <Image
                        source={{ uri: config.url + item.image }}
                        resizeMode="cover"
                        style={item.out_of_stock ? {
                            width: 120,
                            height: 120,
                            borderRadius: 100,
                            opacity: 0.3
                        } : {
                            width: 120,
                            height: 120,
                            borderRadius: 100,
                        }}
                    /> */}

                    <View
                        style={{
                            position: 'absolute',
                            bottom: - 5,
                            width: width * 0.3,
                            height: 35,
                            justifyContent: 'center',
                            flexDirection: 'row',
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
                            activeOpacity={0.9}
                            disabled={item.out_of_stock || getOrderQty(item.subitems.length > 0 ? item.id + '-' : item.id) == 0}
                            onPress={() => checkCart("-", item.id)}
                        >
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 30, lineHeight: 32, color: item.out_of_stock ? 'gray' : 'green' }}>-</Text>
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
                            <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, lineHeight: 25, color: item.out_of_stock ? 'gray' : 'green' }}>{getOrderQty(item.subitems.length > 0 ? item.id + '-' : item.id)}</Text>
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
                            activeOpacity={0.9}
                            disabled={item.out_of_stock}
                            onPress={() => checkCart("+", item.id)}
                        >
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, lineHeight: 25, color: item.out_of_stock ? 'gray' : 'green' }}>+</Text>
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
                <View style={{ flexDirection: 'row', width: width, backgroundColor: 'white', paddingVertical: 20 }}>
                    <TouchableOpacity
                        style={{
                            width: 50,
                            paddingLeft: 20,
                            justifyContent: 'center',
                            marginRight: width * 0.67
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
                        <Image
                            source={search}
                            resizeMode="contain"
                            style={{
                                width: 15,
                                height: 15
                            }}
                        />
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
                }}
                ItemSeparatorComponent={separator}
                renderSectionFooter={sectionFooter}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    paddingTop: searchPressed ? 10 : 180,
                }}
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
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text style={styles.textStyle}>No</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    setModalVisible(!modalVisible)
                                    editOrderAfterKitchenChange()
                                }}
                            >
                                <Text style={styles.textStyle}>Yes</Text>
                            </Pressable>
                        </View>
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
                <TouchableOpacity onPress={() => scrollToSection(index)} ><Text style={{ fontSize: 18, padding: 15 }}>{item.category}</Text></TouchableOpacity>
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
                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, marginLeft: 10, lineHeight: 20 }}>{tempSelectedItem.name}</Text>
                        </View>

                        {minOrderError ?
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'red' }}>* Minimum Order Quantity : {tempSelectedItem.minOrder}</Text>
                            </View>
                            : null}

                        {tempSelectedItem.subitems?.map((subitem) => {
                            return (
                                <View key={subitem.id} style={{ marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', width: width * 0.7, marginBottom: 20, justifyContent: 'center' }}>
                                        <View style={{ alignItems: 'flex-start', width: '70%', justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>{subitem.name}</Text>
                                            {tempSelectedItem.offer > 0 ?
                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold' }}>{'\u20B9'} {subitem.discountrate}</Text>
                                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'gray', textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 10 }}>{'\u20B9'} {subitem.price}</Text>
                                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12, marginLeft: 8, backgroundColor: 'green', color: 'white', paddingLeft: 3, paddingRight: 3 }}>{tempSelectedItem.offer}% off</Text>
                                                </View>
                                                : <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>{'\u20B9'} {subitem.price}</Text>
                                            }
                                        </View>
                                        <View
                                            style={{
                                                width: width * 0.3,
                                                height: 35,
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                                alignSelf: 'center'
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
                                                onPress={() => editOrder("-", tempSelectedItem.id + '-' + subitem.id)}
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
                                                <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, lineHeight: 25, color: 'green' }}>{getOrderQty(tempSelectedItem?.id + '-' + subitem.id)}</Text>
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
                                                onPress={() => editOrder("+", tempSelectedItem.id + '-' + subitem.id)}
                                            >
                                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, lineHeight: 25, color: 'green' }}>+</Text>
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
            totalCartItems>0?
            <View style={{ top: '90%', alignSelf: 'center', position: 'absolute' }}>
                <TouchableOpacity 
                    style={{width: width*0.4, height: 50, borderRadius: 30, backgroundColor: 'lightgreen', ...styles.shadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => navigation.navigate("Cart")}
                >
                    <FAIcon name="shopping-cart" size={22} color="green" />
                    <View style={{width: 22, height: 22, borderRadius: 50, backgroundColor: '#FC6D3F', alignItems: 'center'}}>
                        <Text style={{color: 'white'}}>{totalCartItems}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            :null
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderAnimatedHeader()}
            {renderMenu()}
            {renderKitSwitchModal()}
            {renderSubItemsModal()}
            {renderCategoryModal()}
            {renderCart()}
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