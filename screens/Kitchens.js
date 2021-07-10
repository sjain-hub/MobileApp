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
    ActivityIndicator
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';
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
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchNearbyKitchens()
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

    function findAddress(lat, lon) {
        Geocoder.init(config.GMapAPIKey);
        Geocoder.from(lat, lon)
            .then(json => {
                setUserLocation(json.results[1].formatted_address);
            })
            .catch(error => console.warn(error));
    }

    function onSelectCategory(category) {
        if (category.name == "All") {
            setFilteredKitchens(kitchensData)
            setSelectedCategory(category)
        } else if (category.name == "Desserts & Cakes") {
            let kitchensList = kitchensData.filter(a => 
                a.catdesc.toLowerCase().split(', ').includes('cakes') || a.catdesc.toLowerCase().split(', ').includes('desserts')
            )
            setFilteredKitchens(kitchensList)
            setSelectedCategory(category)
        } else {
            let kitchensList = kitchensData.filter(a => 
                a.catdesc.toLowerCase().split(', ').includes(category.name.toLowerCase())
            )
            setFilteredKitchens(kitchensList)
            setSelectedCategory(category)
        }
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
                            width: width*0.8,
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                            borderRadius: 30,
                            backgroundColor: "#EFEFF1"
                        }}
                    >
                        <Text numberOfLines={1} style={{ fontFamily: "System", fontSize: 16, lineHeight: 22 }}>{userLocation}</Text>
                    </TouchableOpacity>
                </View>

                {/* <TouchableOpacity
                    style={{
                        width: 50,
                        paddingRight: 20,
                        justifyContent: 'center'
                    }}
                >
                    <Image
                        source={search}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20
                        }}
                    />
                </TouchableOpacity> */}
            </View>
        )
    }

    function renderMainCategories() {
        const renderItem = ({ item }) => {
            return (
                <TouchableOpacity
                    style={{
                        width: 70,
                        padding: 10,
                        paddingBottom: 10 * 2,
                        backgroundColor: (selectedCategory?.id == item.id) ? "#FC6D3F" : "white",
                        borderRadius: 30,
                        marginHorizontal: 5,
                        ...styles.shadow
                    }}
                    onPress={() => onSelectCategory(item)}
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
                                marginTop: 10,
                                color: (selectedCategory?.id == item.id) ? "white" : "#1E1F20",
                                fontFamily: "System", fontSize: 12, lineHeight: 22
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>

                </TouchableOpacity>
            )
        }

        return (
            <View style={{ marginBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
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
                style={{  flexDirection: 'row', width: width, marginVertical: 14, paddingHorizontal: 20 }}
                onPress={() => navigation.navigate("Menu", {
                    "kitId": item.id,
                })}
            >
                <Image
                    source={{ uri: config.url + item.dp }}
                    resizeMode="cover"
                    style={{
                        width: width*0.28,
                        height: height*0.16,
                        borderRadius: 10,
                        marginRight: 20
                    }}
                />

                {item.maxDiscount > 0 && <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        height: height * 0.036,
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
                            marginBottom: 5
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

                    {item.acceptAdvcOrders ?
                        <View>
                            <View
                                style={{
                                    marginTop: 5,
                                    marginBottom: 5,
                                    borderBottomColor: '#F5F5F6',
                                    borderBottomWidth: 1,
                                }}
                            />
                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray' }}><Entypo name="info-with-circle" size={12} color="skyblue" /> Accepts Advance Orders upto 2 Days.</Text>
                        </View>
                    : null}

                </View>
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={filteredKitchens}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                ListHeaderComponent={renderMainCategories}
                contentContainerStyle={{
                    paddingBottom: 60
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

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {loading ? renderLoader() : renderRestaurantList()}
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