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
    ActivityIndicator
} from "react-native";
import Modal from 'react-native-modal';
import config from '../config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";


const Addresses = ({ route, navigation }) => {

    const [addresses, setAddresses] = React.useState();
    const [deleteAdd, setDeleteAdd] = React.useState();
    const [addDelModal, setAddDelModal] = React.useState(false);
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserAddresses()
        });
        return unsubscribe;
    }, [])

    async function removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

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
                        setLoading(false)
                        setAddresses(json.addresses)
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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>MANAGE ADDRESSES</Text>
                </View>
            </View>
        )
    }

    function deleteAddress(add) {
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
                        "action": "delete",
                        "addid": add.id,
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        fetchUserAddresses()
                        console.log(json);
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

    function renderAddressList() {
        const separator = () => (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#F5F5F6',
                width: width * 0.9,
                alignSelf: 'center'
            }}></View>
        )

        const renderItem = ({ item }) => (
            <View style={{ marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}>
                <View>
                    <View style={{ width: width * 0.9 }}>
                        <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>{item.place}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginLeft: 10, color: 'gray', marginTop: 10 }}>{item.address}, Floor No: {item.floorNo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Pressable
                            style={{ marginLeft: 10 }}
                            onPress={() => {
                                navigation.navigate("AddNewAddress", {
                                    editAddress: item
                                })
                                removeItemValue("tempRegion")
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: '#FC6D3F' }}>Edit</Text>
                        </Pressable>
                        <Pressable
                            style={{ marginLeft: 30 }}
                            onPress={() => {
                                setDeleteAdd(item)
                                setAddDelModal(true)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 16, color: '#FC6D3F' }}>Delete</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        )

        return (
            <FlatList
                data={addresses}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                ItemSeparatorComponent={separator}
            />
        )
    }

    function renderAddButton() {
        return (
            <View style={{ height: 60, backgroundColor: 'white', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{
                        height: 40,
                        marginRight: 40,
                        marginLeft: 40,
                        backgroundColor: '#FC6D3F',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        ...styles.shadow
                    }}
                    onPress={() => {
                        removeItemValue("tempRegion")
                        navigation.navigate("AddNewAddress")
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18 }}>Add new Address</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function renderDeleteAddressModal() {
        return (
            <Modal
                isVisible={addDelModal}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 30,
                }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Are you sure you want to delete this address?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%' }}
                            onPress={() => setAddDelModal(false)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>No</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setAddDelModal(false)
                                deleteAddress(deleteAdd)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
            {renderGap()}
            {loading ? renderLoader() : renderAddressList()}
            {renderAddButton()}
            {renderDeleteAddressModal()}
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

export default Addresses;