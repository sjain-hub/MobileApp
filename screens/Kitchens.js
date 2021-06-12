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
    ScrollView
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';
import UserPin from '../assets/icons/nearby.png';
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
import FAIcon5 from 'react-native-vector-icons/FontAwesome5';


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

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("region").then((value) => JSON.parse(value))
                .then((json) => {
                    findAddress(json.latitude, json.longitude)
                    fetch(config.url + '/userapi/appnearbyKitchens', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "lon": json.longitude,
                            "lat": json.latitude
                        })
                    }).then((response) => response.json())
                        .then((json) => {
                            // console.log(json.kit_object, "kitchens data")
                            setFilteredKitchens(json.kit_object)
                            setKitchensData(json.kit_object)
                        }).catch((error) => {
                            console.error(error);
                        });
                });
        });
        return unsubscribe;
    }, [navigation])

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
                        paddingLeft: 20,
                        justifyContent: 'center'
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
                        alignItems: 'center',
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
                            width: width*0.7,
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                            borderRadius: 30,
                            backgroundColor: "#EFEFF1"
                        }}
                    >
                        <Text numberOfLines={1} style={{ fontFamily: "Roboto-Bold", fontSize: 16, lineHeight: 22 }}>{userLocation}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
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
                </TouchableOpacity>
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
                        marginRight: 10,
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
                                fontFamily: "Roboto-Regular", fontSize: 12, lineHeight: 22
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>

                </TouchableOpacity>
            )
        }

        return (
            <View style={{ paddingLeft: 20, paddingRight: 20, borderBottomWidth: 5, borderColor: '#F6F6F7' }}>
                <Text style={{ fontFamily: "Roboto-Black", fontSize: 25, lineHeight: 36 }}>Popular Categories</Text>

                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => `${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />
            </View>
        )
    }

    function renderRestaurantList() {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ marginBottom: 20, flexDirection: 'row', width: width, marginVertical: 10, paddingHorizontal: 20 }}
                onPress={() => navigation.navigate("Menu", {
                    item,
                })}
            >
                <Image
                    source={{ uri: config.url + item.dp }}
                    resizeMode="cover"
                    style={{
                        width: width*0.3,
                        height: 130,
                        borderRadius: 30,
                        marginRight: 20
                    }}
                />

                {/* <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        height: 25,
                        width: width * 0.2,
                        backgroundColor: 'white',
                        borderTopRightRadius: 30,
                        borderBottomLeftRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 20,
                        ...styles.shadow
                    }}
                >
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 13, lineHeight: 22 }}>{item.deliveryTime} min</Text>
                </View> */}

                <View style={{ maxWidth: width * 0.56, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.kitName}</Text>

                    {item.catdesc != "" ?
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 13, color: "#C0C0C0", marginBottom: 3 }}>{item.catdesc}</Text>
                    : null}

                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 13, color: "#C0C0C0", marginBottom: 5 }}>{item.landmark}</Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            marginBottom: 5
                        }}
                    >
                        {item.ratings__avg != null ?
                            <View style={{
                                flexDirection: 'row'
                            }}>
                                <Image
                                    source={Star}
                                    style={{
                                        marginTop: 2,
                                        height: 12,
                                        width: 12,
                                        tintColor: (item.ratings__avg >= 4) ? "green" : (item.ratings__avg >= 3) ? "gold" : "red",
                                    }}
                                />
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}> {item.ratings__avg}  |  </Text>
                            </View>
                        : null}
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}>{item.dist} km  |  </Text>
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}>{item.mode} ({item.deliveryTime} min)</Text>
                    </View>

                    <View
                        style={{
                            marginTop: 5,
                            marginBottom: 5,
                            borderBottomColor: '#F5F5F6',
                            borderBottomWidth: 1,
                        }}
                    />

                    {item.acceptAdvcOrders ?
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12, color: 'gray' }}><FAIcon5 name="info-circle" size={12} color="skyblue" /> Accepts Advance Orders upto 2 Days.</Text>
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
                    paddingTop: 20,
                    paddingBottom: 30
                }}
            />
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {/* <ScrollView>
                {renderMainCategories()}
                {renderRestaurantList()}
            </ScrollView> */}
            {renderRestaurantList()}
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
        elevation: 2,
    }
})

export default kitchens;