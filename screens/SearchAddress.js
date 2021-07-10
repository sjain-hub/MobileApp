import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    TextInput,
    SafeAreaView,
    FlatList,
    Pressable,
} from "react-native";
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
navigator.geolocation = require('@react-native-community/geolocation');
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


const SearchAddress = ({ route, navigation }) => {

    const [addresses, setAddresses] = React.useState();
    const [goToScreen, setGoToScreen] = React.useState();
    const [showSavedAddresses, setShowSavedAddresses] = React.useState(true);

    React.useEffect(() => {
        let { fromScreen } = route.params;
        setGoToScreen(fromScreen)
        fetchUserAddresses()
    }, [])

    function fetchUserAddresses() {
        AsyncStorage.getItem("authToken").then((value) => {
            if (value) {
                fetch(config.url + '/userapi/appGetAddresses', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Token ' + value
                    },
                }).then((response) => response.json())
                    .then((json) => {
                        setAddresses(json.addresses)
                    }).catch((error) => {
                         if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
                    });
            }
        });
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

    function renderSearchLoc() {
        const checkLength = (text) => {
            if (text.length == 0) {
                setShowSavedAddresses(true)
            }
            else {
                setShowSavedAddresses(false)
            }
        }

        return (
            <View style={{height: showSavedAddresses? 80 : height}}>
                <GooglePlacesAutocomplete
                    placeholder='Search location'
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        setRegion(details.geometry.location)
                    }}
                    styles={{
                        textInputContainer: {
                            width: width * 0.9,
                            alignSelf: 'center',
                        },
                        textInput: {
                            backgroundColor: '#EFEFF1',
                            borderRadius: 30,
                            paddingHorizontal: 20,
                        },
                        listView: {
                            width: width * 0.9,
                            alignSelf: 'center',
                        },
                    }}
                    textInputProps={{
                        onChangeText: (text) => checkLength(text)
                    }}
                    enablePoweredByContainer={false}
                    query={{
                        key: config.GMapAPIKey,
                        language: 'en',
                        components: 'country:in',
                    }}
                    debounce={200}
                />
            </View>
        )
    }

    function setRegion(reg) {
        let newRegion = {
            latitude: reg.latitude || reg.lat,
            longitude: reg.longitude || reg.lng,
            latitudeDelta: 0.0025,
            longitudeDelta: 0.0025
        }
        if (goToScreen == "AddNewAddress") {
            AsyncStorage.setItem('tempRegion', JSON.stringify(newRegion))
        } else {
            AsyncStorage.setItem('region', JSON.stringify(newRegion))
        }
        navigation.navigate(goToScreen)
    }

    function renderSavedAddresses() {
        const separator = () => (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#F5F5F6',
                width: width * 0.9,
                alignSelf: 'center'
            }}></View>
        )

        const listHeader = () => (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 5,
                borderColor: '#F5F5F6',
                width: width,
                alignSelf: 'center'
            }}></View>
        )

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => setRegion(item)}
            >
                <View style={{ width: width * 0.9 }}>
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>{item.place}</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14, marginLeft: 10, color: 'gray', marginTop: 10 }}>{item.address}, Floor No: {item.floorNo}</Text>
                </View>
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={addresses}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                ItemSeparatorComponent={separator}
                ListHeaderComponent={listHeader}
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderSearchLoc()}
            {showSavedAddresses ? renderSavedAddresses() : null}
        </SafeAreaView>
    )

}

export default SearchAddress;

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