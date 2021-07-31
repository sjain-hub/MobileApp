import React from "react";
const { width, height } = Dimensions.get("window");
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    FlatList,
    ScrollView,
    Pressable,
    ActivityIndicator
} from "react-native";
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import UserPin from '../assets/icons/map-pin.png';
import Star from '../assets/icons/star.png';
import NorthIndian from '../assets/icons/nindian.png';
import noodle from '../assets/icons/noodle.png';
import hamburger from '../assets/icons/hamburger.png';
import pizza from '../assets/icons/pizza.png';
import fries from '../assets/icons/fries.png';
import donut from '../assets/icons/donut.png';
import drink from '../assets/icons/drink.png';
import sindian from '../assets/icons/sindian.png';
import all from '../assets/icons/all.png';
import search from "../assets/icons/search.png";
import config from '../config.json';
import Entypo from 'react-native-vector-icons/Entypo';
import AntIcon from 'react-native-vector-icons/AntDesign';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import MultiSlider from '@ptomasroos/react-native-multi-slider';


const kitchens = ({ route, navigation }) => {

    const categoryData = [
        {
            id: 1,
            name: "All",
            icon: all,
        },
        {
            id: 2,
            name: "Chinese",
            icon: noodle,
        },
        {
            id: 3,
            name: "Burgers",
            icon: hamburger,
        },
        {
            id: 4,
            name: "Pizza",
            icon: pizza,
        },
        {
            id: 5,
            name: "Snacks",
            icon: fries,
        },
        {
            id: 6,
            name: "Desserts & Cakes",
            icon: donut,
        },
        {
            id: 7,
            name: "Shakes",
            icon: drink,
        },
        {
            id: 8,
            name: "North Indian",
            icon: NorthIndian,
        },
        {
            id: 9,
            name: "South Indian",
            icon: sindian,
        },

    ]

    const [categories, setCategories] = React.useState(categoryData)
    const [userLocation, setUserLocation] = React.useState(null)
    const [selectedCategory, setSelectedCategory] = React.useState({ "icon": 18, "id": 1, "name": "All" })
    const [kitchensData, setKitchensData] = React.useState([])
    const [filteredKitchens, setFilteredKitchens] = React.useState([])
    const [finalKitchens, setFinalKitchens] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [activeOrders, setActiveOrders] = React.useState();
    const [filtersModal, setFiltersModal] = React.useState(false)
    const [sliderValue, setSliderValue] = React.useState([10]);
    const [filterAdvOrders, setFilterAdvOrders] = React.useState(false)
    const [filterPureVeg, setFilterPureVeg] = React.useState(false)
    const [filterHomeDel, setFilterHomeDel] = React.useState(false)
    const [filterRatings, setFilterRatings] = React.useState(false)
    const [filterOffers, setFilterOffers] = React.useState(false)

    const [tempSliderValue, setTempSliderValue] = React.useState([10]);
    const [tempFilterAdvOrders, setTempFilterAdvOrders] = React.useState(false)
    const [tempFilterPureVeg, setTempFilterPureVeg] = React.useState(false)
    const [tempFilterHomeDel, setTempFilterHomeDel] = React.useState(false)
    const [tempFilterRatings, setTempFilterRatings] = React.useState(false)
    const [tempFilterOffers, setTempFilterOffers] = React.useState(false)
    

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchNearbyKitchens()
            fetchActiveOrders()
            applyFilters()
            resetTempFilters()
        });
        return unsubscribe;
    }, [navigation])

    function fetchNearbyKitchens() {
        AsyncStorage.getItem("region").then((value) => JSON.parse(value))
        .then((json) => {
            findAddress(json.latitude, json.longitude)
            fetch(config.url + '/userapi/appnearbyKitchens', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "lon": json.longitude,
                    "lat": json.latitude
                })
            }).then((response) => response.json())
                .then((json) => {
                    setLoading(false)
                    setFilteredKitchens(json.kit_object)
                    setFinalKitchens(json.kit_object)
                    setKitchensData(json.kit_object)
                }).catch((error) => {
                     if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
                });
        });
    }

    function fetchActiveOrders() {
        AsyncStorage.getItem("authToken").then((value) => {
            if (value) {
                fetch(config.url + '/userapi/apporders', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + value
                    },
                    body: JSON.stringify({
                        "action": "active"
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setActiveOrders(json.orders)
                    }).catch((error) => {
                        if (error == 'TypeError: Network request failed') {
                            navigation.navigate("NoInternet")
                        } else {
                            console.error(error)
                        }
                    });
            }
        });
    }

    function findAddress(lat, lon) {
        Geocoder.init(config.GMapAPIKey);
        Geocoder.from(lat, lon)
            .then(json => {
                setUserLocation(json.results[1].formatted_address);
            })
            .catch(error => console.warn(error));
    }

    function onSelectCategory(category, kitchens) {
        if (category.name == "All") {
            setFinalKitchens(kitchens)
            setSelectedCategory(category)
        } else if (category.name == "Desserts & Cakes") {
            let kitchensList = kitchens.filter(a => 
                a.catdesc.toLowerCase().split(', ').includes('cakes') || a.catdesc.toLowerCase().split(', ').includes('desserts')
            )
            setFinalKitchens(kitchensList)
            setSelectedCategory(category)
        } else {
            let kitchensList = kitchens.filter(a => 
                a.catdesc.toLowerCase().split(', ').includes(category.name.toLowerCase())
            )
            setFinalKitchens(kitchensList)
            setSelectedCategory(category)
        }
        setLoading(false)
    }

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: 'lightgray' }}>
                <TouchableOpacity
                    style={{
                        width: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Image
                        source={UserPin}
                        resizeMode="contain"
                        style={{
                            width: 25,
                            height: 25
                        }}
                    />
                </TouchableOpacity>

                <View
                    style={{
                        flex: 1,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        height: 50
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate("SearchAddress", {
                            fromScreen: "Kitchens"
                        })}
                        style={{
                            height: 40,
                            width: width-100,
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingHorizontal: 20,
                            borderRadius: 30,
                            backgroundColor: "#EFEFF1"
                        }}
                    >
                        <Text numberOfLines={1} style={{ fontFamily: "System", fontSize: 16 }}>{userLocation}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={{
                        width: 50,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={() => setFiltersModal(true)}
                >
                    <AntIcon name="filter" size={28} color= {'gray'} />
                </TouchableOpacity>
            </View>
        )
    }

    function renderFiltersModal() {
        const sliderValuesChange = (value) => {
            setTempSliderValue(value)
        }

        return (
            <Modal
                isVisible={filtersModal}
                onBackdropPress={() => {
                    setFiltersModal(false)
                    resetTempFilters()
                }}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    backgroundColor: "white",
                    alignItems: "flex-start",
                    borderRadius: 10,
                    height: 550,
                    width: width * 0.9,
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                }}>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', width: '84%' }}>FILTERS</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                        <View style={{width: '80%', marginRight: '10%'}}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>Advance Orders</Text>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}>The Order can be Scheduled according to your Convenience</Text>
                        </View>
                        <BouncyCheckbox
                            size={20}
                            isChecked={filterAdvOrders}
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            iconStyle={{ borderColor: "green" }}
                            onPress={() => setTempFilterAdvOrders(!filterAdvOrders)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                        <View style={{width: '80%', marginRight: '10%'}}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>Pure Veg</Text>
                        </View>
                        <BouncyCheckbox
                            size={20}
                            isChecked={filterPureVeg}
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            iconStyle={{ borderColor: "green" }}
                            onPress={() => setTempFilterPureVeg(!filterPureVeg)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                        <View style={{width: '80%', marginRight: '10%'}}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>Home Delivery</Text>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}>Food will be Delivered at your doorstep</Text>
                        </View>
                        <BouncyCheckbox
                            size={20}
                            isChecked={filterHomeDel}
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            iconStyle={{ borderColor: "green" }}
                            onPress={() => setTempFilterHomeDel(!filterHomeDel)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                        <View style={{width: '80%', marginRight: '10%'}}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>High Rated</Text>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}>Kitchens rated more than 3</Text>
                        </View>
                        <BouncyCheckbox
                            size={20}
                            isChecked={filterRatings}
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            iconStyle={{ borderColor: "green" }}
                            onPress={() => setTempFilterRatings(!filterRatings)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                        <View style={{width: '80%', marginRight: '10%'}}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>Offers</Text>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}>Kitchens offering discounts</Text>
                        </View>
                        <BouncyCheckbox
                            size={20}
                            isChecked={filterOffers}
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            iconStyle={{ borderColor: "green" }}
                            onPress={() => setTempFilterOffers(!filterOffers)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 12 }}>
                        <View style={{ width: '70%', marginRight: '10%' }}>
                            <Text style={{ fontFamily: "System", fontSize: 16 }}>Distance</Text>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}>Select the range of distance</Text>
                        </View>
                        <Text style={{ fontFamily: "System", fontSize: 16, color: 'green' }}>0 - {tempSliderValue} km</Text>
                    </View>
                    <View style={{alignItems: 'center', width: '100%', marginBottom: 20}}>
                        <MultiSlider
                            values={sliderValue}
                            sliderLength={width*0.7}
                            onValuesChange={sliderValuesChange}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ backgroundColor: '#ff0033', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5, ...styles.shadow, alignSelf: 'center' }}
                        onPress={() => {
                            applyFilters(selectedCategory)
                            setFiltersModal(false)
                        }}
                    >
                        <Text style={{ fontFamily: "System", fontWeight: 'bold', color: 'white', fontSize: 16 }}>APPLY FILTERS</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }

    function applyFilters() {
        console.log(tempFilterAdvOrders, tempFilterPureVeg, tempFilterHomeDel, tempFilterRatings, tempFilterOffers, tempSliderValue);
        setLoading(true)
        setFilterAdvOrders(tempFilterAdvOrders)
        setFilterPureVeg(tempFilterPureVeg)
        setFilterHomeDel(tempFilterHomeDel)
        setFilterRatings(tempFilterRatings)
        setFilterOffers(tempFilterOffers)
        setSliderValue(tempSliderValue)

        let kitchensList = kitchensData.filter(a => {
            var selected = true
            if (tempFilterAdvOrders && a.acceptAdvcOrders != tempFilterAdvOrders) {
                selected = false
            }
            if (tempFilterPureVeg && a.pureVeg != tempFilterPureVeg) {
                selected = false
            }
            if (tempFilterHomeDel && a.mode != "Delivery") {
                selected = false
            }
            if (tempFilterRatings && (a.avgrating == null || a.avgrating <= 3)) {
                selected = false
            }
            if (tempFilterOffers && a.maxDiscount == 0) {
                selected = false
            }
            if (a.dist > tempSliderValue) {
                selected = false
            }

            return selected;
        })
        
        setFilteredKitchens(kitchensList)
        setSelectedCategory({ "icon": 18, "id": 1, "name": "All" })
        onSelectCategory({ "icon": 18, "id": 1, "name": "All" }, kitchensList)
    }

    function renderMainCategories() {
        const renderItem = ({ item }) => {
            return (
                <TouchableOpacity
                    style={{
                        width: 72,
                        padding: 10,
                        paddingBottom: 10 * 2,
                        backgroundColor: (selectedCategory?.id == item.id) ? "#FC6D3F" : "white",
                        borderRadius: 30,
                        marginHorizontal: 5,
                        alignItems: "center",
                        ...styles.shadow
                    }}
                    onPress={() => onSelectCategory(item, filteredKitchens)}
                >
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: (selectedCategory?.id == item.id) ? "white" : "#F5F5F6"
                        }}
                    >
                        <Image
                            source={item.icon}
                            resizeMode="contain"
                            style={{
                                width: 30,
                                height: 30
                            }}
                        />
                    </View>

                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text
                            style={{
                                marginTop: 5,
                                color: (selectedCategory?.id == item.id) ? "white" : "#1E1F20",
                                fontFamily: "System", fontSize: 12
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>

                </TouchableOpacity>
            )
        }

        return (
            <View style={{ marginBottom: 0, paddingLeft: 20, paddingRight: 20 }}>
                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    keyExtractor={item => `${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingVertical: 20 }}
                />
                <View style={{
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#F5F5F6',
                    width: width*0.6,
                    alignSelf: 'center'
                }}></View>
            </View>
        )
    }

    function renderRestaurantList() {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                // disabled={item.status == "Closed" ? true : false}
                style={{  flexDirection: 'row', width: width, marginVertical: 14, paddingHorizontal: 20 }}
                onPress={() => navigation.navigate("Menu", {
                    "kitId": item.id,
                })}
            >
                <Image
                    source={{ uri: config.url + item.dp }}
                    resizeMode="cover"
                    style={{
                        width: width*0.26,
                        height: 120,
                        borderRadius: 10,
                        marginRight: 20,
                        opacity: item.status == 'Closed' ? 0.5 : 1
                    }}
                />

                {item.status == 'Closed' ?
                    <View
                        style={{
                            position: 'absolute',
                            top: 45,
                            height: 30,
                            width: width * 0.26,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 20,
                            ...styles.shadow
                        }}>
                        <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold' }}>CLOSED</Text>
                    </View>
                    :
                    null
                }

                {item.maxDiscount > 0 && <View
                    style={{
                        position: 'absolute',
                        top: 86,
                        height: 34,
                        width: width * 0.2,
                        backgroundColor: 'white',
                        borderTopRightRadius: 10,
                        borderBottomLeftRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 20,
                        ...styles.shadow
                    }}
                >
                    <Text style={{ fontFamily: "System", fontSize: 14, fontWeight: 'bold', color: '#FC6D3F' }}>{item.maxDiscount}% OFF</Text>
                </View>}

                <View style={{ maxWidth: width * 0.56, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.kitName}</Text>

                    {item.catdesc != "" ?
                        <Text style={{ fontFamily: "System", fontSize: 13, color: "gray", marginBottom: 3 }}>{item.catdesc}</Text>
                    : null}

                    <Text style={{ fontFamily: "System", fontSize: 13, color: "gray", marginBottom: 5 }}>{item.landmark}</Text>

                    <View
                        style={{
                            flexDirection: 'row',
                        }}
                    >
                        {item.avgrating ?
                            <View style={{
                                flexDirection: 'row'
                            }}>
                                <Image
                                    source={Star}
                                    style={{
                                        marginTop: 2,
                                        height: 13,
                                        width: 13,
                                        tintColor: (item.avgrating >= 4) ? "green" : (item.avgrating >= 3) ? "gold" : "red",
                                    }}
                                />
                                <Text style={{ fontFamily: "System", fontSize: 13 }}> {item.avgrating}  |  </Text>
                            </View>
                        : null}
                        <Text style={{ fontFamily: "System", fontSize: 13 }}>{item.dist} km  |  </Text>
                        <Text style={{ fontFamily: "System", fontSize: 13 }}>{item.mode} ({item.deliveryTime} min)</Text>
                    </View>

                    {item.acceptAdvcOrders || item.pureVeg || item.mode == "PickUp" ?
                        <View
                            style={{
                                marginTop: 5,
                                borderBottomColor: '#F5F5F6',
                                borderBottomWidth: 1,
                            }}
                        />
                        :
                        null
                    }
                    
                    {item.acceptAdvcOrders ?
                        <View style={{marginTop: 5}}>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}><Entypo name="info-with-circle" size={12} color="skyblue" />  Accepts Advance Orders upto 2 Days.</Text>
                        </View>
                    : null}

                    {item.pureVeg?
                        <View style={{marginTop: 5}}>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}><FAIcon name="leaf" size={12} color="green" />  Pure Veg</Text>
                        </View>
                        :
                        null
                    }

                    {item.mode == "PickUp" ?
                        <View style={{marginTop: 5}}>
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}><Entypo name="warning" size={12} color="red" />  Delivery Not available</Text>
                        </View>
                        :
                        null
                    }
                </View>
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={finalKitchens}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                // ListHeaderComponent={renderMainCategories}
                contentContainerStyle={{
                    paddingBottom: activeOrders?.length > 0 ? 120 : 80
                }}
            />
        )
    }

    function renderLoader() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#FC6D3F"/>
            </View>
        )
    }

    function renderActiveOrders() {
        return (
            <View
                style={{
                    position: 'absolute',
                    height: 100,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                }}
            >
                <TouchableOpacity
                    style={{
                        height: 40,
                        width: width,
                        backgroundColor: 'lightgreen',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginVertical: 10
                    }}
                    onPress={() => navigation.navigate("Orders")}
                >
                    <Text style={{ color: 'white', fontSize: 16 }}>{activeOrders?.length} Active {activeOrders?.length > 1 ? "Orders" : "Order"}  <AntIcon name="right" size={16} /><AntIcon name="right" size={16} /><AntIcon name="right" size={16} /></Text>
                </TouchableOpacity>
            </View>
        )
    }

    function resetTempFilters() {
        setTempSliderValue(sliderValue)
        setTempFilterAdvOrders(filterAdvOrders)
        setTempFilterPureVeg(filterPureVeg)
        setTempFilterHomeDel(filterHomeDel)
        setTempFilterRatings(filterRatings)
        setTempFilterOffers(filterOffers)
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {loading ?
                renderLoader()
                :
                <View style={{ flex: 1 }}>
                    {renderMainCategories()}
                    {renderRestaurantList()}
                    {activeOrders?.length > 0 ?
                        renderActiveOrders()
                        :
                        null
                    }
                </View>
            }
            {renderFiltersModal()}
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
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    }
})

export default kitchens;