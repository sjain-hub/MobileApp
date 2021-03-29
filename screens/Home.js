import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import KitPin from '../assets/icons/hamburger.png'
import UserPin from '../assets/icons/map-pin.png'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ route, navigation }) => {

    const mapView = React.useRef()
    const [region, setRegion] = React.useState(null)
    const [kitchensData, setKitchensData] = React.useState([])
    const [marginBottom, setMarginBottom] = React.useState(1)

    React.useEffect(() => {

        currentLocation()
        fetchKitchens()

        const watchId = Geolocation.watchPosition(pos => {
            alert(pos.coords.latitude)
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
        })
    }

    const fetchKitchens = async () => {
        fetch('http://192.168.0.100:8000/kitapi/', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json())
            .then((json) => {
                console.log(json, "kitchens data")
                setKitchensData(json)
            }).catch((error) => {
                console.error(error);
            });
    };

    function updateUserLocation(loc) {
        let newRegion = {
            latitude: loc.latitude,
            longitude: loc.longitude,
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
                                            source={{ uri: 'http://192.168.0.100:8000' + kitchen.dp }} 
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
                            backgroundColor: 'red',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 25
                        }}
                        onPress={() =>  navigation.navigate("Home")}
                    >
                        <Text style={{ color: 'white', fontSize: 20 }}>Order Now</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {renderMap()}
            {renderButton()}
        </View>
    )

}

export default Home;