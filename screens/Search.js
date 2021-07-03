import React, { useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    Pressable,
    TouchableOpacity,
    TextInput,
    FlatList
} from "react-native";
const { width, height } = Dimensions.get("window");
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import back from "../assets/icons/back.png";
import Star from '../assets/icons/star.png';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';



const Search = ({ route, navigation }) => {

    const [showScanner, setShowScanner] = React.useState(true);
    const [searchText, setSearchText] = React.useState();
    const [showSearchResults, setShowSearchResults] = React.useState(true);
    const [showRecentSearches, setShowRecentSearches] = React.useState(true);
    const [allKitchens, setAllKitchens] = React.useState([])
    const [searchedKitchens, setSearchedKitchens] = React.useState([])
    const [recentSearchedIds, setRecentSearchedIds] = React.useState([])
    const [recentSearchedKitchens, setRecentSearchedKitchens] = React.useState([])

    useFocusEffect(
        React.useCallback(() => {
            fetchAllKitchens()
            checkLength("")

            return () => setShowScanner(false)
        }, [])
    );

    function fetchAllKitchens() {
        AsyncStorage.getItem("region").then((value) => JSON.parse(value))
        .then((json) => {
            fetch(config.url + '/userapi/appgetKitchen', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "lon": json.longitude,
                    "lat": json.latitude,
                })
            }).then((response) => response.json())
                .then((json) => {
                    setAllKitchens(json.kit_object)
                    findRecentlySearchedKitchens(json.kit_object)
                }).catch((error) => {
                     if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
                });
        });
    }

    function findRecentlySearchedKitchens(allkits) {
        AsyncStorage.getItem("recentSearches").then((value) => JSON.parse(value))
        .then((json) => {
            if(json) {
                setRecentSearchedIds(json)
                let recentlysearcheditems = allkits.filter(item =>
                    json.includes(item.id)
                )
                setRecentSearchedKitchens(recentlysearcheditems)
            }
            else {
                setShowRecentSearches(false)
            }
        });
    }

    function onSuccess(data) {
        setShowScanner(false)
        navigation.navigate("Menu", {
            "kitId": data.data,
        })
       
    }

    function checkLength(text) {
        setSearchText(text)
        if (text.length == 0) {
            setShowScanner(true)
            setShowSearchResults(false)
            setShowRecentSearches(true)
            setSearchedKitchens([])
        }
        else {
            setShowScanner(false)
            setShowSearchResults(true)
            setShowRecentSearches(false)
            let searcheditems = allKitchens.filter(item =>
                item.kitName.toLowerCase().includes(text.toLowerCase())
            )
            setSearchedKitchens(searcheditems)
        }
    }

    function renderSearchBox() {
        return (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <TextInput
                    placeholder={"Search Kitchen"}
                    value={searchText}
                    style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: width * 0.9, backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 10, ...styles.shadow }}
                    onChangeText={(text) => checkLength(text)}
                >
                </TextInput>
            </View>
        )
    }

    function renderSearchResults() {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{  flexDirection: 'row', width: width, marginVertical: 10 }}
                onPress={() => {
                    navigation.navigate("Menu", {
                        "kitId": item.id,
                    })
                    var temparray = recentSearchedIds? recentSearchedIds : []
                    if(!temparray.includes(item.id)) {
                        temparray.push(item.id)
                        AsyncStorage.setItem('recentSearches', JSON.stringify(temparray))
                    }
                }}
            >
                <Image
                    source={{ uri: config.url + item.dp }}
                    resizeMode="cover"
                    style={{
                        width: 76,
                        height: 80,
                        borderRadius: 10,
                        marginRight: 20
                    }}
                />

                <View style={{ maxWidth: width * 0.56, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>{item.kitName}</Text>

                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 12, color: "#C0C0C0", marginBottom: 5 }}>{item.landmark}</Text>

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

                </View>
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={searchedKitchens}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                contentContainerStyle={{
                    marginTop: 20,
                    marginHorizontal: 20
                }}
            />
        )
    }

    function renderRecentSearches() {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ width: 100, marginRight: 10, alignItems: 'center' }}
                onPress={() => {
                    navigation.navigate("Menu", {
                        "kitId": item.id,
                    })
                }}
            >
                <Image
                    source={{ uri: config.url + item.dp }}
                    resizeMode="cover"
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 50,
                    }}
                />

                <View style={{alignItems: 'center', marginTop: 5 }}>
                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14, color: 'gray' }}>{item.kitName}</Text>
                </View>
            </TouchableOpacity>
        )

        return (
            <View style={{paddingHorizontal: 20}}>
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}>Recents</Text>
                <FlatList
                    data={recentSearchedKitchens}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => `${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ marginTop: 10 }}
                />
            </View>
        )
    }

    function renderScanner() {
        const renderQRText = () => {
            return (
                <View style={{ borderRadius: 50, backgroundColor: '#FC6D3F', alignSelf: 'center', position: 'absolute', zIndex: 1, bottom: -400 }}>
                    <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'white', paddingVertical: 4, fontStyle: 'italic', paddingHorizontal: 30 }}>Scan Kitchen's QR Code</Text>
                </View>
            )
        }

        return (
            <View style={{bottom: -78}}>
                <QRCodeScanner
                    onRead={onSuccess}
                    reactivate={true}
                    permissionDialogMessage={'Need Permission to access your Camera'}
                    showMarker={true}
                    markerStyle={{ borderRadius: 10, borderColor: 'white' }}
                    bottomContent={
                        <View style={{ borderRadius: 50, backgroundColor: '#FC6D3F' }}>
                            <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'white', paddingVertical: 5, paddingHorizontal: 20 }}>Scan QR Code</Text>
                        </View>
                    }
                />
                {renderQRText()}
            </View>    
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderSearchBox()}
            {showRecentSearches ? renderRecentSearches() : null}
            {showScanner ? renderScanner() : null}
            {showSearchResults ? renderSearchResults() : null}
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

export default Search;