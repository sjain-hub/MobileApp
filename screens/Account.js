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
    ActivityIndicator
} from "react-native";
import Modal from 'react-native-modal';
const { width, height } = Dimensions.get("window");
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
// import messaging from '@react-native-firebase/messaging';


const Account = ({ route, navigation }) => {

    const [numberValid, setNumberValid] = React.useState(false);
    const [regFormComplt, setRegFormComplt] = React.useState(false);
    const [phoneNo, setPhoneNo] = React.useState();
    const [username, setUsername] = React.useState();
    const [email, setEmail] = React.useState();
    const [firstname, setFirstname] = React.useState();
    const [lastname, setLastname] = React.useState();
    const [otpSent, setOtpSent] = React.useState(false);
    const [registerUser, setRegisterUser] = React.useState(false);
    const [otp, setOtp] = React.useState();
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
    const [user, setUser] = React.useState();
    const [cameFrom, setCameFrom] = React.useState(false);
    const [errors, setErrors] = React.useState();
    const [confirm, setConfirm] = React.useState(null);
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        let { cameFrom } = route.params;
        setCameFrom(cameFrom)

        const subscriber = auth().onAuthStateChanged((user) => {
            AsyncStorage.getItem("authToken").then((value) => {
                if (value) {
                    fetchUserAccDetails(value)
                    setLoggedIn(true)
                } else if (user) {
                    setLoading(true)
                    var pno = user.phoneNumber.substring(3)
                    setPhoneNo(pno)
                    checkUser(pno)
                } else {
                    setLoading(false)
                }
            });
        });
        return subscriber;
    }, [])

    function fetchUserAccDetails(authToken) {
        fetch(config.url + '/userapi/appFetchUser', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: 'Token ' + authToken
            },
        }).then((response) => response.json())
            .then((json) => {
                setLoading(false)
                setUser(json.user)
            }).catch((error) => {
                 if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
            });
    }

    async function removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    function checkNumber(num) {
        if (num.length == 10) {
            setNumberValid(true)
            setPhoneNo(num)
        }
        else {
            setNumberValid(false)
        }
    }

    function checkUser(phone) {
        fetch(config.url + '/userapi/appcheckuser', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "phone": phone,
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.resp == "UserVerified") {
                    requestLogin(phone)
                }
                else {
                    setLoading(false)
                    setRegisterUser(true)
                    setOtpSent(false)
                }
            }).catch((error) => {
                 if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
            });
    }

    async function sendOTP() {
        setLoading(true)
        const confirmation = await auth().signInWithPhoneNumber('+91 ' + phoneNo);
        setConfirm(confirmation);
        if (confirmation._auth._authResult) {
            setOtpSent(true)
        } else {
            alert("Internal Error, send Again")
        }
        setLoading(false)
    }

    function requestLogin(phone) {
        fetch(config.url + '/userapi/applogin', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "phone": phone
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.token) {
                    setLoading(false)
                    AsyncStorage.setItem('authToken', json.token)
                    if (cameFrom) {
                        navigation.goBack()
                    } else {
                        setLoggedIn(true)
                        fetchUserAccDetails(json.token)
                    }
                }
                else {
                    alert(json.detail)
                }
                setOtpSent(false)
            }).catch((error) => {
                 if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
            });
    }

    function requestRegister() {
        setLoading(true)
        fetch(config.url + '/userapi/appregister', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "phone": phoneNo,
                "email": email,
                "first_name": firstname,
                "last_name": lastname,
                "username": username,
            })
        }).then((response) => response.json())
            .then((json) => {
                if (json.token) {
                    setLoading(false)
                    AsyncStorage.setItem('authToken', json.token)
                    if (cameFrom) {
                        navigation.goBack()
                    } else {
                        setRegisterUser(false)
                        setLoggedIn(true)
                        setOtpSent(false)
                        fetchUserAccDetails(json.token)
                    }
                }
                else {
                    setErrors(json)
                    setOtpSent(false)
                }
            }).catch((error) => {
                 if(error == 'TypeError: Network request failed') {
                    navigation.navigate("NoInternet")        
                } else {
                    console.error(error)     
                }
            });
    }

    async function verifyOTP() {
        setLoading(true)
        try {
            await confirm.confirm(otp);
            checkUser(phoneNo)
          } catch (error) {
            alert('Invalid code.');
          }
    }

    function checkRegistrationForm(un, em, fn, ln) {
        if (un && em && fn && ln) {
            setRegFormComplt(true)
        }
        else {
            setRegFormComplt(false)
        }
    }

    function renderLogin() {
        return (
            <View style={{ backgroundColor: '#fcecdd', flex: 1 }}>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ width: width * 0.9, backgroundColor: 'white', alignSelf: 'center', borderRadius: 30, opacity: 0.9, ...styles.shadow }}>
                        {otpSent ?
                            <View style={{ padding: 50 }}>
                                <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold' }}>Enter OTP</Text>
                                <Text style={{ fontFamily: "System", color: 'gray', marginTop: 20 }}>Enter 4 digit OTP to verify and proceed.</Text>
                                <View
                                    style={{
                                        marginTop: 20,
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                        paddingHorizontal: 10,
                                        backgroundColor: '#F5F5F6',
                                    }}
                                >
                                    <TextInput
                                        autoFocus
                                        keyboardType={'number-pad'}
                                        maxLength={6}
                                        style={{ fontFamily: "System", fontSize: 30, width: '100%' }}
                                        onChangeText={(text) => setOtp(text)}
                                    >
                                    </TextInput>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        height: 40,
                                        backgroundColor: '#FC6D3F',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 10,
                                        marginTop: 20
                                    }}
                                    onPress={() => verifyOTP()}
                                >
                                    <Text style={{ color: 'white', fontSize: 16 }}>Verify</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            registerUser ?
                                <View style={{ padding: 50 }}>
                                    <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold' }}>Register</Text>
                                    <Text style={{ fontFamily: "System", color: 'gray', marginTop: 10 }}>Create your new account</Text>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Username</Text>
                                        <TextInput
                                            autoFocus
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%',  backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={username}
                                            onChangeText={(text) => {
                                                setUsername(text)
                                                setErrors({
                                                    'username': null,
                                                    'email': errors?.email
                                                })
                                                checkRegistrationForm(text, email, firstname, lastname)
                                            }}
                                        >
                                        </TextInput>
                                        {errors?.username?
                                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'red'
                                         }}>{errors.username}</Text>
                                            : null
                                        }
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Phone</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%',  backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={'+91 ' + phoneNo}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Email</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%',  backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={email}
                                            onChangeText={(text) => {
                                                setEmail(text)
                                                setErrors({
                                                    'username': errors?.username,
                                                    'email': null
                                                })
                                                checkRegistrationForm(username, text, firstname, lastname)
                                            }}
                                        >
                                        </TextInput>
                                        {errors?.email?
                                            <Text style={{ fontFamily: "System", fontSize: 12, color: 'red' }}>{errors.email}</Text>
                                            : null
                                        }
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>First Name</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%',  backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={firstname}
                                            onChangeText={(text) => {
                                                setFirstname(text)
                                                checkRegistrationForm(username, email, text, lastname)
                                            }}
                                        >
                                        </TextInput>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "System", fontSize: 14, color: 'grey' }}>Last Name</Text>
                                        <TextInput
                                            style={{ fontFamily: "System", fontSize: 16, width: '100%',  backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={lastname}
                                            onChangeText={(text) => {
                                                setLastname(text)
                                                checkRegistrationForm(username, email, firstname, text)
                                            }}
                                        >
                                        </TextInput>
                                    </View>
                                    <TouchableOpacity
                                        disabled={!regFormComplt}
                                        style={{
                                            height: 40,
                                            backgroundColor: regFormComplt ? '#FC6D3F' : 'lightgray',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 10,
                                            marginTop: 20
                                        }}
                                        onPress={() => requestRegister()}
                                    >
                                        <Text style={{ color: regFormComplt ? 'white' : 'gray', fontSize: 16 }}>Verify and Register</Text>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View style={{ padding: 50 }}>
                                    <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold' }}>LOGIN</Text>
                                    <Text style={{ fontFamily: "System", color: 'gray', marginTop: 20 }}>Enter your 10 digit mobile number to Login/Register</Text>
                                    <View
                                        style={{
                                            height: 50,
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            paddingHorizontal: 10,
                                            backgroundColor: '#F5F5F6',
                                        }}
                                    >
                                        <TextInput
                                            keyboardType={'number-pad'}
                                            maxLength={10}
                                            style={{ fontFamily: "System", fontSize: 20, width: '100%' }}
                                            onChangeText={(text) => checkNumber(text)}
                                            placeholder="E.g. : 9876543216"
                                        >
                                        </TextInput>
                                    </View>
                                    <TouchableOpacity
                                        disabled={!numberValid}
                                        style={{
                                            height: 40,
                                            backgroundColor: numberValid ? '#FC6D3F' : 'lightgray',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 10,
                                            marginTop: 20
                                        }}
                                        onPress={() => sendOTP()}
                                    >
                                        <Text style={{ color: numberValid ? 'white' : 'gray', fontSize: 16 }}>Send OTP</Text>
                                    </TouchableOpacity>
                                </View>
                        }
                    </View>
                </View>
            </View>
        )
    }

    function renderGap() {
        return (
            <View style={{
                borderStyle: 'solid',
                borderWidth: 5,
                borderColor: '#F5F5F6',
            }}></View>
        )
    }

    function renderUser() {
        return (
            <View>
                <View style={{ flexDirection: 'row', marginHorizontal: 20, paddingVertical: 30 }}>
                    <Text style={{ fontFamily: "System", fontSize: 20 }}>Hello,  </Text>
                    <Text style={{ fontFamily: "System", fontSize: 20, fontWeight: 'bold' }}>{user?.first_name} {user?.last_name}</Text>
                </View>
                <View style={{borderStyle: 'solid', borderWidth: 1}}></View>
            </View>
        )
    }

    function renderProfileTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("Profile")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>My Profile</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderFavKitchensTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("FavKitchens")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Favourite Kitchens</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderOrdersTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("Orders")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Orders</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderAddressesTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("Addresses")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Manage Addresses</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderLatestUpdatesTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("LatestUpdates")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Latest Updates</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        ) 
    }

    function renderHelpTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => navigation.navigate("Help")}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Help?</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderLogoutTab() {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, justifyContent: 'center' }}
                onPress={() => setLogoutModalVisible(true)}
            >
                <View style={{ width: width * 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "System", fontSize: 18 }}>Logout</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="logout" size={30} color={'red'} />
                </View>
            </TouchableOpacity>
        )
    }

    function renderLogoutConfirmationModal() {
        return (
            <Modal
                isVisible={logoutModalVisible}
                onBackdropPress={() => setLogoutModalVisible(!logoutModalVisible)}
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
                    padding: 35,
                }}>
                    <Text style={{ fontFamily: "System", fontSize: 16 }}>Are you sure you want to Logout?</Text>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <Pressable
                            style={{ width: '40%' }}
                            onPress={() => setLogoutModalVisible(!logoutModalVisible)}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setLogoutModalVisible(!logoutModalVisible)
                                setLoggedIn(false)
                                removeItemValue('authToken')
                                auth().signOut().then(() => console.log('User signed out!'));
                            }}
                        >
                            <Text style={{ fontFamily: "System", fontSize: 18, color: '#FC6D3F' }}>Logout</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )
    }

    function renderFooter() {
        return (
            <View style={{ borderStyle: 'solid', borderWidth: 100, borderColor: '#F5F5F6', width: width }}></View>
        )
    }

    function renderAccount() {
        return (
            <View>
                {renderUser()}
                {renderGap()}
                <ScrollView>
                    {renderProfileTab()}
                    {renderGap()}
                    {renderFavKitchensTab()}
                    {renderGap()}
                    {renderOrdersTab()}
                    {renderGap()}
                    {renderAddressesTab()}
                    {renderGap()}
                    {renderLatestUpdatesTab()}
                    {renderGap()}
                    {renderHelpTab()}
                    {renderGap()}
                    {renderGap()}
                    {renderLogoutTab()}
                    {renderGap()}
                    {renderFooter()}
                </ScrollView>
            </View>
        )
    }

    function renderLoader() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#FC6D3F"/>
            </View>
        )
    }

    // async function checkPermission() {
    //     const enabled = await messaging().hasPermission()
    //     if(enabled) {
    //         getToken()
    //     } else {
    //         requestPermission()
    //     }
    // }

    // async function getToken() {
    //     fcmToken = await messaging().getToken()
    //     console.log(fcmToken)
    // }

    return (
        <SafeAreaView style={styles.container}>
            {renderLogoutConfirmationModal()}
            {
                loading ?
                    renderLoader()
                    :
                    <View style={{ flex: 1 }}>
                        {loggedIn ?
                            renderAccount()
                            :
                            renderLogin()
                        }
                    </View>
            }
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

export default Account;