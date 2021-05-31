import React, { useRef } from "react";
import config from '../config.json';
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
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get("window");
import back from "../assets/icons/back.png";


const Profile = ({ route, navigation }) => {

    const [otpSent, setOtpSent] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const [updateFormValid, setUpdateFormValid] = React.useState(false);
    const [user, setUser] = React.useState();
    const [phoneNo, setPhoneNo] = React.useState();
    const [email, setEmail] = React.useState();
    const [otp, setOtp] = React.useState();
    const [errors, setErrors] = React.useState();

    React.useEffect(() => {
        fetchUserAccDetails()
    }, [])

    function fetchUserAccDetails() {
        AsyncStorage.getItem("authToken").then((value) => {
            if (value) {
                fetch(config.url + '/userapi/appFetchUser', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Token ' + value
                    },
                }).then((response) => response.json())
                    .then((json) => {
                        setUser(json.user)
                        setPhoneNo(json.user.phone)
                        setEmail(json.user.email)
                    }).catch((error) => {
                        console.error(error);
                    });
            }
        });
    }

    function checkUpdateForm(ph, em) {
        setErrors(false)
        if (ph && em) {
            if (ph.length == 10 && (ph != user.phone || em != user.email)) {
                setUpdateFormValid(true)
            } else {
                setUpdateFormValid(false)
            }
        } else {
            setUpdateFormValid(false)
        }
    }

    function sendOTP() {
        setOtpSent(true)
    }

    function verifyOTPAndUpdate() {
        AsyncStorage.getItem("authToken").then((token) => {
            if (token) {
                fetch(config.url + '/userapi/appUpdateProfile', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: token ? 'Token ' + token : ''
                    },
                    body: JSON.stringify({
                        "phone": phoneNo,
                        "email": email,
                        "otp": otp
                    })
                }).then((response) => response.json())
                    .then((json) => {
                        setOtpSent(false)
                        if(json.response) {
                            alert(json.response)
                            setEditMode(false)
                            fetchUserAccDetails()
                        } else {
                            setErrors(json)
                        }
                    }).catch((error) => {
                        console.error(error);
                    });

            }
        });
    }

    function renderLogin() {
        return (
            <View style={{ backgroundColor: '#fcecdd', flex: 1 }}>
                {renderHeader()}
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ width: width * 0.9, backgroundColor: 'white', alignSelf: 'center', borderRadius: 30, opacity: 0.9, ...styles.shadow }}>
                        {otpSent ?
                            <View style={{ padding: 50 }}>
                                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, fontWeight: 'bold' }}>Enter OTP</Text>
                                <Text style={{ fontFamily: "Roboto-Regular", color: 'gray', marginTop: 20 }}>Enter 4 digit OTP to verify and proceed.</Text>
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
                                        maxLength={4}
                                        style={{ fontFamily: "Roboto-Bold", fontSize: 30, width: '100%' }}
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
                                    onPress={() => verifyOTPAndUpdate()}
                                >
                                    <Text style={{ color: 'white', fontSize: 16 }}>Verify and Update</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            editMode ?
                                <View style={{ padding: 50 }}>
                                    <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, fontWeight: 'bold' }}>Profile</Text>
                                    <Text style={{ fontFamily: "Roboto-Regular", color: 'gray', marginTop: 10 }}>Update your account details</Text>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Username</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.username}
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
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Full Name</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.first_name + ' ' + user?.last_name}
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
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Phone</Text>
                                        <TextInput
                                            keyboardType={'number-pad'}
                                            maxLength={10}
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={phoneNo}
                                            onChangeText={(text) => {
                                                setPhoneNo(text)
                                                checkUpdateForm(text, email)
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
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Email</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={email}
                                            onChangeText={(text) => {
                                                setEmail(text)
                                                checkUpdateForm(phoneNo, text)
                                            }}
                                        >
                                        </TextInput>
                                        {errors?.detail?
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'red' }}>{errors.detail}</Text>
                                        : null
                                        }
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'center' }}>
                                        <Pressable
                                            style={{ width: '60%' }}
                                            onPress={() => setEditMode(false)}
                                        >
                                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, color: '#FC6D3F' }}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            disabled={!updateFormValid}
                                            onPress={() => {
                                                sendOTP()
                                            }}
                                        >
                                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, color: updateFormValid ? '#FC6D3F' : 'lightgray' }}>Update</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                :
                                <View style={{ padding: 50 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: "Roboto-Regular", fontSize: 20, fontWeight: 'bold', width: width * 0.5 }}>Profile</Text>
                                        <Pressable
                                            style={{ alignItems: 'center' }}
                                            onPress={() => setEditMode(true)}
                                        >
                                            <Text style={{ fontFamily: "Roboto-Regular", fontSize: 18, color: '#FC6D3F' }}>Edit</Text>
                                        </Pressable>
                                    </View>
                                    <View
                                        style={{
                                            marginTop: 20,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Username</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.username}
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
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Full Name</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={user?.first_name + ' ' + user?.last_name}
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
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Phone</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={phoneNo}
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
                                        <Text style={{ fontFamily: "Roboto-Bold", fontSize: 14, color: 'grey' }}>Email</Text>
                                        <TextInput
                                            style={{ fontFamily: "Roboto-Bold", fontSize: 16, width: '100%', backgroundColor: '#F5F5F6', height: 40, paddingHorizontal: 10 }}
                                            value={email}
                                            editable={false}
                                        >
                                        </TextInput>
                                    </View>
                                </View>
                        }
                    </View>
                </View>
            </View>
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
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderLogin()}
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

export default Profile;