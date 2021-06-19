import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    FlatList,
    Dimensions,
    Pressable,
    TouchableOpacity,
    TextInput,
} from "react-native";
import config from '../config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const AddNewAddresses = ({ route, navigation }) => {

    const mapView = React.useRef()
    const [region, setRegion] = React.useState(null)
    const [userLocation, setUserLocation] = React.useState(null)
    const [mapHeight, setMapHeight] = React.useState(height * 0.6 + 1)
    const [address, setAddress] = React.useState()
    const [floorNo, setFloorNo] = React.useState()
    const [place, setPlace] = React.useState()
    const [formValid, setFormValid] = React.useState(false)
    const [editAddress, setEditAddress] = React.useState()

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("tempRegion").then((value) => JSON.parse(value))
                .then((reg) => {
                    if (reg) {
                        updateUserLocation(reg)
                    }
                    else {
                        if (route.params) {
                            let { editAddress } = route.params
                            setEditAddress(editAddress);
                            let reg = {
                                latitude: editAddress.latitude,
                                longitude: editAddress.longitude,
                                latitudeDelta: 0.025,
                                longitudeDelta: 0.025
                            }
                            updateUserLocation(reg)
                            setAddress(editAddress.address)
                            setFloorNo(editAddress.floorNo)
                            setPlace(editAddress.place)
                            setFormValid(true)
                        }
                        else {
                            currentLocation()
                        }
                    }
                });

            setTimeout(() => {
                setMapHeight(height * 0.6)
            }, 100);

        });
        return unsubscribe;
    }, [navigation])

    function currentLocation() {
        Geolocation.getCurrentPosition(pos => {
            let mapRegion = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                latitudeDelta: 0.025,
                longitudeDelta: 0.025
            }
            setRegion(mapRegion)
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

    function updateUserLocation(reg) {
        setRegion(reg)
        findAddress(reg?.latitude, reg?.longitude)
        mapView.current.animateToRegion(reg, 200)
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
                <View
                    style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>{editAddress? "Edit Address" : "Add new Address"}</Text>
                </View>
            </View>
        )
    }

    function renderLocation() {
        const userLocation = () => (
            <View style={{ top: '50%', left: '50%', marginLeft: -25, marginTop: -50, position: 'absolute' }}>
                <MaterialIcons name="location-pin" size={50} color={'#000080'} />
            </View>
        )

        const onRegionChange = (reg) => {
            setRegion(reg)
            findAddress(reg.latitude, reg.longitude)
        }

        return (
            <View style={{ width: width, height: mapHeight }}>
                <MapView
                    ref={mapView}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    style={{ width: width, height: height * 0.6, top: 0 }}
                    onRegionChangeComplete={region => onRegionChange(region)}
                >
                </MapView>
                {userLocation()}
            </View>
        )
    }

    function renderBottomPart() {
        return (
            <View style={{ position: 'absolute', bottom: 0, backgroundColor: 'white', height: height * 0.33 }}>
                {renderSearchBox()}
                {renderAddressForm()}
                {renderAddButton()}
            </View>
        )
    }

    function renderSearchBox() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row' }}
                onPress={() => navigation.navigate("SearchAddress", {
                    fromScreen: "AddNewAddress"
                })}
            >
                <View
                    style={{
                        width: width * 0.1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <MaterialIcons name="location-searching" size={25} />
                </View>
                <View
                    style={{
                        width: width * 0.9,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        backgroundColor: '#F5F5F6',
                    }}
                >
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, width: '100%' }}>{userLocation}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    function checkForm(add, floor, place) {
        if (add && floor && place) {
            // if(editAddress){
            //     if(add != editAddress.address || floor != editAddress.floorNo || place != editAddress.place || lat != editAddress.latitude || lng != editAddress.longitude) {
            //         setFormValid(true)
            //     }
            //     else {
            //         setFormValid(false)
            //     }
            // } 
            // else {
            //     setFormValid(true)
            // }
            setFormValid(true)
        }
        else {
            setFormValid(false)
        }
    }

    function renderAddressForm() {
        return (
            <View style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
                <View>
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 16, color: 'gray' }}>Enter Full Address:</Text>
                    <TextInput
                        value={address}
                        style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', paddingHorizontal: 10, borderBottomWidth: 1, paddingVertical: 5, borderBottomColor: 'lightgray' }}
                        onChangeText={(text) => {
                            setAddress(text)
                            checkForm(text, floorNo, place)
                        }}
                    >
                    </TextInput>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ width: '30%' }}>
                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 16, color: 'gray' }}>Floor No:</Text>
                        <TextInput
                            value={floorNo}
                            keyboardType={'number-pad'}
                            maxLength={2}
                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', paddingHorizontal: 10, borderBottomWidth: 1, paddingVertical: 5, borderBottomColor: 'lightgray' }}
                            onChangeText={(text) => {
                                setFloorNo(text)
                                checkForm(address, text, place)
                            }}
                        >
                        </TextInput>
                    </View>
                    <View style={{ width: '64%', marginLeft: '6%' }}>
                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 16, color: 'gray' }}>Name of Place:</Text>
                        <TextInput
                            value={place}
                            maxLength={30}
                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', paddingHorizontal: 10, borderBottomWidth: 1, paddingVertical: 5, borderBottomColor: 'lightgray' }}
                            onChangeText={(text) => {
                                setPlace(text)
                                checkForm(address, floorNo, text)
                            }}
                        >
                        </TextInput>
                    </View>
                </View>
            </View>
        )
    }

    function renderAddButton() {
        return (
            <View style={{ height: 60, backgroundColor: 'white', justifyContent: 'center' }}>
                <TouchableOpacity
                    disabled={!formValid}
                    style={{
                        height: 40,
                        marginRight: 40,
                        marginLeft: 40,
                        backgroundColor: formValid ? '#FC6D3F' : 'lightgray',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        ...styles.shadow
                    }}
                    onPress={() => saveAddress()}
                >
                    <Text style={{ color: formValid ? 'white' : 'gray', fontSize: 18 }}>{editAddress? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function saveAddress() {
        AsyncStorage.getItem("authToken").then((authToken) => {
            if (authToken) {
                fetch(config.url + '/userapi/appSaveAddress', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + authToken
                    },
                    body: JSON.stringify({
                        "latitude": region.latitude,
                        "longitude": region.longitude,
                        "address": address,
                        "floorNo": floorNo,
                        "place": place,
                        "action": editAddress? "update" : "add",
                        "addid": editAddress? editAddress.id : null,
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        if (json.response) {
                            navigation.goBack()
                        } else {
                            console.log(json);
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
            }
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderLocation()}
            {renderBottomPart()}
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

export default AddNewAddresses;