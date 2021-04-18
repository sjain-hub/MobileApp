import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet
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
    const [kitchensData, setKitchensData] = React.useState([])
    const [marginBottom, setMarginBottom] = React.useState(1)

    React.useEffect(() => {

        currentLocation()
        fetchKitchens()

        const watchId = Geolocation.watchPosition(pos => {
            // alert(pos.coords.latitude)
            updateUserLocation(pos)
        },
            error => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        )

        setTimeout(() => {
            setMarginBottom(0)
        }, 100);

    }, [])

    function currentLocation() {
        Geolocation.getCurrentPosition(pos => {
            let mapRegion = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                latitudeDelta: 0.0025,
                longitudeDelta: 0.0025
            }
            setRegion(mapRegion)
            AsyncStorage.setItem('region', JSON.stringify(mapRegion))
            // setAddress(pos.coords.latitude, pos.coords.longitude)
        })
    }

    async function setAddress(lat, lon) {
        Geocoder.init(config.GMapAPIKey);
        Geocoder.from(lat, lon)
		.then(json => {
            console.log(json, "adddress")
        		var addressComponent = json.results[0].address_components[0];
			console.log(addressComponent);
		})
		.catch(error => console.warn(error));
    }

    const fetchKitchens = async () => {
        fetch(config.url+'/userapi/', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json())
            .then((json) => {
                // console.log(json, "kitchens data")
                setKitchensData(json)
            }).catch((error) => {
                console.error(error);
            });
    };

    function updateUserLocation(loc) {
        let newRegion = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.0025,
            longitudeDelta: 0.0025
        }

        setRegion(newRegion)
        AsyncStorage.setItem('region', JSON.stringify(newRegion))
        mapView.current.animateToRegion(newRegion, 200)
    }

    function onRegionChange(region) {
        setRegion(region)
        AsyncStorage.setItem('region', JSON.stringify(region))
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

    function renderLocationHeader() {
        return (
            <View
                style={{
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
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
                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16, lineHeight: 22 }}>abcd</Text>
                    </View>
                </View>
            </View>
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
                        onPress={() =>  navigation.navigate("Tabs")}
                    >
                        <Text style={{ color: 'white', fontSize: 20 }}>Explore Kitchens</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {renderMap()}
            {renderLocationHeader()}
            {renderButton()}
        </View>
    )

}

export default Home;

const styles = StyleSheet.create({
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