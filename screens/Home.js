import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    SafeAreaView,
    BackHandler,
} from "react-native";
const { width, height } = Dimensions.get("window");
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import KitPin from '../assets/icons/hamburger.png'
import UserPin from '../assets/icons/map-pin.png'
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import Geocoder from 'react-native-geocoding';

const Home = ({ route, navigation }) => {

    const mapView = React.useRef()
    const [region, setRegion] = React.useState(null)
    const [userLocation, setUserLocation] = React.useState(null)
    const [kitchensData, setKitchensData] = React.useState([])
    const [marginBottom, setMarginBottom] = React.useState(1)

    // const backAction = () => {
    //     removeItemValue("region")
    //     BackHandler.exitApp()
    //     return true;
    // };

    // React.useEffect(() => {
    //     BackHandler.addEventListener("hardwareBackPress", backAction);

    //     return () =>
    //         BackHandler.removeEventListener("hardwareBackPress", backAction);
    // }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("region").then((value) => JSON.parse(value))
                .then((reg) => {
                    if (reg) {
                        updateUserLocation(reg)
                    } else {
                        currentLocation()
                    }
                });

            fetchKitchens()

            // const watchId = Geolocation.watchPosition(pos => {
            //     // alert(pos.coords.latitude)
            //     updateUserLocation(pos)
            // },
            //     error => console.log(error),
            //     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            // )

            setTimeout(() => {
                setMarginBottom(0)
            }, 100);
        });
        return unsubscribe;

    }, [navigation])

    async function removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    function currentLocation() {
        Geolocation.getCurrentPosition(pos => {
            let mapRegion = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                latitudeDelta: 0.025,
                longitudeDelta: 0.025
            }
            setRegion(mapRegion)
            AsyncStorage.setItem('region', JSON.stringify(mapRegion))
            findAddress(pos.coords.latitude, pos.coords.longitude)
        })
    }

    function findAddress(lat, lon) {
        Geocoder.init(config.GMapAPIKey);
        Geocoder.from(lat, lon)
            .then(json => {
                setUserLocation(json.results[1].formatted_address);
            })
            .catch(error => console.warn(error));
    }

    const fetchKitchens = async () => {
        fetch(config.url + '/userapi/', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json())
            .then((json) => {
                setKitchensData(json)
            }).catch((error) => {
                if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                } 
            });
    };

    function updateUserLocation(reg) {
        setRegion(reg)
        findAddress(reg.latitude, reg.longitude)
        mapView.current.animateToRegion(reg, 200)
    }

    function onRegionChange(region) {
        setRegion(region)
        AsyncStorage.setItem('region', JSON.stringify(region))
        findAddress(region.latitude, region.longitude)
    }

    function renderMap() {

        const userLocation = () => (
            <View style={{ top: '50%', left: '50%', marginLeft: -25, marginTop: -50, position: 'absolute' }}>
                <Image source={UserPin}
                    style={{
                        width: 40,
                        height: 40,
                    }}
                />
            </View>
        )

        return (
            <View style={{ flex: 1 }}>
                <MapView
                    ref={mapView}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={region}
                    style={{ flex: 1, marginBottom: marginBottom }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    onRegionChangeComplete={region => onRegionChange(region)}
                >
                    {kitchensData?.map((kitchen) => (
                        <Marker
                            coordinate={{ latitude: kitchen.latitude, longitude: kitchen.longitude }}
                            key={kitchen.id}
                            title={kitchen.kitName}
                        >
                            <Image source={KitPin}
                                style={{
                                    width: 40,
                                    height: 40,
                                }}
                            />
                            {/* <Callout tooltip={true}>
                                <View>
                                    <View style={{
                                        width: 250,
                                        flexDirection: 'column',
                                        alignSelf: 'flex-start',
                                        padding: 15,
                                        borderWidth: 1,
                                        borderRadius: 15,
                                        borderColor: '#ccc',
                                        backgroundColor: 'white'
                                    }}>
                                        <Text style={{ fontSize: 16 }}>{kitchen.kitName}</Text>
                                        <Text style={{alignItems:'center'}}><Image 
                                            source={{ uri: config.url + kitchen.dp }} 
                                            style={{ width: 220, height: 150 }} 
                                            resizeMode="cover"
                                        /></Text>
                                    </View>
                                    <View style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent',
                                        borderTopColor: '#007a87',
                                        borderWidth: 16,
                                        alignSelf: 'center',
                                        marginTop: -0.5
                                    }}></View>
                                    <View style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent',
                                        borderTopColor: '#fff',
                                        borderWidth: 16,
                                        alignSelf: 'center',
                                        marginTop: -32
                                    }}></View>
                                </View>
                            </Callout> */}
                        </Marker>
                    ))}
                </MapView>
                {userLocation()}
            </View>
        )
    }

    function renderSearchLocation() {
        return (
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 60,
                    left: 0,
                    right: 0,
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onPress={() => navigation.navigate("SearchAddress", {
                    fromScreen: "Home"
                })}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: width * 0.9,
                        paddingVertical: 10,
                        paddingHorizontal: 10 * 2,
                        borderRadius: 30,
                        backgroundColor: "white",
                        ...styles.shadow
                    }}
                >
                    <Image
                        source={UserPin}
                        style={{
                            width: 20,
                            height: 20,
                            marginRight: 10
                        }}
                    />

                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontFamily: "Roboto-Regular", fontSize: 16, lineHeight: 22 }}>{userLocation}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    function renderButton() {
        return (
            <View
                style={{
                    position: 'absolute',
                    bottom: 30,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <View
                    style={{
                        width: '100%'
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            height: 50,
                            marginRight: 40,
                            marginLeft: 40,
                            backgroundColor: '#FC6D3F',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 25,
                            ...styles.shadow
                        }}
                        onPress={() => navigation.navigate("Tabs")}
                    >
                        <Text style={{ color: 'white', fontSize: 20 }}>Explore Kitchens</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderMap()}
            {renderSearchLocation()}
            {renderButton()}
        </SafeAreaView>
    )

}

export default Home;

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
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 5,
    }
})