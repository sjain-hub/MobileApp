import React from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import Star from '../assets/icons/star.png';
import FAIcon5 from 'react-native-vector-icons/FontAwesome5';


const FavKitchens = ({ route, navigation }) => {

    const [favKitchens, setFavKitchens] = React.useState();

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("authToken").then((value) => {
                if (value) {
                    fetchFavouriteKitchens(value)
                }
            });
        });
        return unsubscribe;
    }, [navigation])

    function fetchFavouriteKitchens(authtoken) {
        AsyncStorage.getItem("region").then((value) => JSON.parse(value))
        .then((json) => {
            fetch(config.url + '/userapi/appfavouriteKitchens', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Token ' + authtoken
                },
                body: JSON.stringify({
                    "lon": json.longitude,
                    "lat": json.latitude
                })
            }).then((response) => response.json())
                .then((json) => {
                    setFavKitchens(json.kit_object)
                }).catch((error) => {
                     if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
                });
        });
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 10,
                borderColor: '#F5F5F6',
            }}></View>
        )
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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>FAVOURITE KITCHENS</Text>
                </View>
            </View>
        )
    }

    function renderFavKitchens() {
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
                        width: 110,
                        height: 120,
                        borderRadius: 10,
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
                    <Text style={{ fontFamily: "System", fontSize: 13, lineHeight: 22 }}>{item.deliveryTime} min</Text>
                </View> */}

                <View style={{ maxWidth: width * 0.56, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.kitName}</Text>

                    {item.catdesc != "" ?
                        <Text style={{ fontFamily: "System", fontSize: 13, color: "#C0C0C0", marginBottom: 3 }}>{item.catdesc}</Text>
                    : null}

                    <Text style={{ fontFamily: "System", fontSize: 13, color: "#C0C0C0", marginBottom: 5 }}>{item.landmark}</Text>

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
                                        height: 12,
                                        width: 12,
                                        tintColor: (item.avgrating >= 4) ? "green" : (item.avgrating >= 3) ? "gold" : "red",
                                    }}
                                />
                                <Text style={{ fontFamily: "System", fontSize: 12 }}> {item.avgrating}  |  </Text>
                            </View>
                        : null}
                        <Text style={{ fontFamily: "System", fontSize: 12 }}>{item.dist} km  |  </Text>
                        <Text style={{ fontFamily: "System", fontSize: 12 }}>{item.mode} ({item.deliveryTime} min)</Text>
                    </View>

                </View>
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={favKitchens}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                contentContainerStyle={{
                    paddingVertical: 40
                }}
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderGap()}
            {renderFavKitchens()}
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

export default FavKitchens;