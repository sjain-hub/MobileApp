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
    FlatList,
    ActivityIndicator
} from "react-native";
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";
import FAIcon from 'react-native-vector-icons/FontAwesome';


const Orders = ({ route, navigation }) => {

    const [orders, setOrders] = React.useState();
    const [loading, setLoading] = React.useState(true)
    const [reviewsModal, setReviewsModal] = React.useState(false)
    const [helpModal, setHelpModal] = React.useState(false)
    const [reviewsObject, setReviewsObject] = React.useState();
    const [reviews, setReviews] = React.useState();
    const [ratings, setRatings] = React.useState();
    const [helpKitchenId, setHelpKitchenId] = React.useState();
    const [helpOrderId, setHelpOrderId] = React.useState();
    const [helpCustPhoneNo, setHelpCustPhoneNo] = React.useState();
    const [helpSubject, setHelpSubject] = React.useState();
    const [helpQuery, setHelpQuery] = React.useState();
    var  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem("authToken").then((value) => {
                if (value) {
                    fetch(config.url + '/userapi/apporders', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Token ' + value
                        }
                    }).then((response) => response.json())
                        .then((json) => {
                            setLoading(false)
                            setOrders(json.orders)
                        }).catch((error) => {
                            if (error == 'TypeError: Network request failed') {
                                navigation.navigate("NoInternet")
                            } else {
                                console.error(error)
                            }
                        });
                }
            });
        });
        return unsubscribe;
    }, [navigation])

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
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>ORDERS</Text>
                </View>
            </View>
        )
    }

    function renderOrders() {

        const getFormattedDate = (timestamp) => {
            var date = new Date(timestamp)
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
            return (date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear() + "   " + (date.getHours()>12 ? date.getHours()-12 + ":" + (date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes()) + " pm" : date.getHours() + ":" + (date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes()) + " am"))
        }

        const getColor = (status) => {
            if (status=="Delivered" || status=="Picked") {
                return "#4BB543"
            }
            else if (status=="Rejected" || status=="Cancelled") {
                return "red"
            }
            else if (status=="Waiting" || status=="Placed" || status=="Payment" || status=="Preparing" || status=="Packed" || status=="Dispatched") {
                return "#FFCC00"
            }
        }

        const ratingsModal = (kitId) => {
            AsyncStorage.getItem("authToken").then((value) => {
                if (value) {
                    fetch(config.url + '/userapi/appgetAndAddReviews', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Token ' + value
                        },
                        body: JSON.stringify({
                            "kitId": kitId,
                            "action": "get"
                        })
                    }).then((response) => response.json())
                        .then((json) => {
                            setReviewsObject(json.reviews)
                            setReviews(json.reviews.reviews)
                            setRatings(json.reviews.ratings)
                            setReviewsModal(true)
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

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{width: width*0.9, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 10, backgroundColor: 'white', marginVertical: 16, ...styles.shadow}}
                onPress={() => navigation.navigate(item.status == "Payment"? "Payment" : "OrderDetails", {
                    order: item
                })}
            >
                <View style={{flexDirection: 'row'}}>
                    <View style={{width: '70%', marginRight: 5}}>
                        <Text style={{ fontFamily: "System", fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{item.kitchen.kitName}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', marginBottom: 10 }}>{item.itemswithquantity}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10 }}>{'\u20B9'}{item.total_amount}</Text>
                        <Text style={{ fontFamily: "System", fontSize: 12, color: 'gray', marginBottom: 10 }}>{getFormattedDate(item.scheduled_order)}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end', width: '30%'}}>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 10, color: getColor(item.status), fontWeight: 'bold' }}>{item.status}</Text>
                    </View>
                </View>
                {getColor(item.status) == "#FFCC00" ?
                    <View style={{ height: 40, backgroundColor: '#FFCC00', alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginVertical: 10}}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Track Order</Text>
                    </View>
                    :
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <TouchableOpacity
                            style={{
                                height: 30,
                                width: '40%',
                                borderColor: 'green',
                                borderWidth: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 14
                            }}
                            onPress={() => {
                                ratingsModal(item.kitchen.id)
                            }}
                        >
                            <Text style={{ color: 'green', fontSize: 12 }}>Rate Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: 30,
                                width: '40%',
                                borderColor: 'red',
                                borderWidth: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                marginVertical: 10,
                                paddingHorizontal: 20,
                                marginHorizontal: 14
                            }}
                            onPress={() => {
                                setHelpKitchenId(item.kitchen.id)
                                setHelpOrderId(item.id)
                                setHelpModal(true)
                            }}
                        >
                            <Text style={{ color: 'red', fontSize: 12 }}>Help</Text>
                        </TouchableOpacity>
                    </View>
                }
            </TouchableOpacity>
        )

        return (
            <FlatList
                data={orders}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingVertical: 20,
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

    function renderReviewsModal() {
        const updateReviews = (kitId) => {
            AsyncStorage.getItem("authToken").then((value) => {
                if (value) {
                    fetch(config.url + '/userapi/appgetAndAddReviews', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Token ' + value
                        },
                        body: JSON.stringify({
                            "kitId": kitId,
                            "action": "add",
                            "comment": reviews,
                            "rating": ratings
                        })
                    }).then((response) => response.json())
                        .then((json) => {
                            alert(json.response)
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

        return (
            <Modal
                isVisible={reviewsModal}
                onBackdropPress={() => setReviewsModal(!reviewsModal)}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 20,
                }}>
                    <View>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginBottom: 10 }}>Rate this Kitchen</Text>
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <TouchableOpacity
                                onPress={() => setRatings(1)}
                                style={{marginRight: 10}}
                            >
                                {ratings >= 1 ?
                                    <FAIcon name="star" size={40} color="gold" />
                                    :
                                    <FAIcon name="star-o" size={40} color="gold" />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRatings(2)}
                                style={{marginRight: 10}}
                            >
                                {ratings >= 2 ?
                                    <FAIcon name="star" size={40} color="gold" />
                                    :
                                    <FAIcon name="star-o" size={40} color="gold" />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRatings(3)}
                                style={{marginRight: 10}}
                            >
                                {ratings >= 3 ?
                                    <FAIcon name="star" size={40} color="gold" />
                                    :
                                    <FAIcon name="star-o" size={40} color="gold" />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRatings(4)}
                                style={{marginRight: 10}}
                            >
                                {ratings >= 4 ?
                                    <FAIcon name="star" size={40} color="gold" />
                                    :
                                    <FAIcon name="star-o" size={40} color="gold" />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRatings(5)}
                            >
                                {ratings >= 5 ?
                                    <FAIcon name="star" size={40} color="gold" />
                                    :
                                    <FAIcon name="star-o" size={40} color="gold" />
                                }
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={{borderWidth: 1, borderColor: 'lightgray', borderRadius: 10, marginTop: 20, justifyContent: "flex-start", height: 150, width: width*0.8, fontSize: 16, padding: 14}}
                            placeholder="Add you Review"
                            numberOfLines={4}
                            multiline={true}
                            value={reviews}
                            onChangeText={(text) => setReviews(text)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: "center", alignItems: "center", }}>
                        <Pressable
                            style={{ marginRight: '30%' }}
                            onPress={() => setReviewsModal(!reviewsModal)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setReviewsModal(!reviewsModal)
                                updateReviews(reviewsObject.kit)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Update</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function renderHelpModal() {
        return (
            <Modal
                isVisible={helpModal}
                onBackdropPress={() => setHelpModal(!helpModal)}
                style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 20,
                    width: width*0.9
                }}>
                    <View>
                        <Text style={{ fontFamily: "System", fontSize: 18, marginBottom: 20 }}>Provide the details here</Text>
                        <Text style={{ fontFamily: "System", fontSize: 16, marginBottom: 5 }}>Phone number</Text>
                        <Text style={{ fontFamily: "System", fontSize: 14, marginBottom: 5, color: 'gray' }}>The number should be on PayTm (for refund request).</Text>
                        <TextInput
                            style={{borderWidth: 1, borderColor: 'lightgray', borderRadius: 5, fontSize: 18, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 20}}
                            keyboardType={'number-pad'}
                            maxLength={10}
                            // value={reviews}
                            // onChangeText={(text) => setReviews(text)}
                        />
                        <Text style={{ fontFamily: "System", fontSize: 16, marginBottom: 5 }}>Subject</Text>
                        <TextInput
                            style={{borderWidth: 1, borderColor: 'lightgray', borderRadius: 5, fontSize: 16, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 20}}
                            maxLength={50}
                            // value={reviews}
                            // onChangeText={(text) => setReviews(text)}
                        />
                        <Text style={{ fontFamily: "System", fontSize: 16, marginBottom: 5 }}>Query</Text>
                        <TextInput
                            style={{borderWidth: 1, borderColor: 'lightgray', borderRadius: 5, fontSize: 16, paddingHorizontal: 10, paddingVertical: 20, maxHeight: 160, marginBottom: 20}}
                            numberOfLines={4}
                            multiline={true}
                            maxLength={400}
                            // value={reviews}
                            // onChangeText={(text) => setReviews(text)}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: "center", alignItems: "center", }}>
                        <Pressable
                            style={{ marginRight: '30%' }}
                            onPress={() => setHelpModal(!helpModal)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Close</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setHelpModal(!helpModal)
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Send Query</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderGap()}
            {loading? renderLoader() : renderOrders()}
            {renderReviewsModal()}
            {renderHelpModal()}
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
        elevation: 10,
    }
})

export default Orders;