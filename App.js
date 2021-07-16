import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native'
import PushNotification from "react-native-push-notification";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Home, Kitchens, Menu, KitchenDetails, VideoPlayer, Cart, Account, Profile, FavKitchens, Orders, Addresses, Search, AddNewAddress, SearchAddress, OrderDetails, NoInternet, Payment, LatestUpdates, Test } from './screens'
import Tabs from './navigation/tabs'

const Stack = createStackNavigator();

const App = () => {

    const [allSet, setAllSet] = React.useState(false)

    React.useEffect(() => {
        removeItemValue("region")

        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                console.log("TOKEN:", token);
            },

            // (required) Called when a remote is received or opened, or local notification is opened
            onNotification: function (notification) {
                console.log("NOTIFICATION:", notification);

                // process the notification

                // (required) Called when a remote is received or opened, or local notification is opened
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },

            // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
            onAction: function (notification) {
                console.log("ACTION:", notification.action);
                console.log("NOTIFICATION======:", notification);

                // process the action
            },

            // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
            onRegistrationError: function (err) {
                console.error(err.message, err);
            },

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             * - if you are not using remote notification or do not have Firebase installed, use this:
             *     requestPermissions: Platform.OS === 'ios'
             */
            requestPermissions: true,
        });
    }, [])

    async function removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            setAllSet(true)
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    return (
        <NavigationContainer>
            {allSet && <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
                initialRouteName={'Home'}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Tabs" component={Tabs} />
                <Stack.Screen name="Kitchens" component={Kitchens} />
                <Stack.Screen name="Menu" component={Menu} />
                <Stack.Screen name="KitchenDetails" component={KitchenDetails} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
                <Stack.Screen name="Cart" component={Cart} />
                <Stack.Screen name="Account" component={Account} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="FavKitchens" component={FavKitchens} />
                <Stack.Screen name="Orders" component={Orders} />
                <Stack.Screen name="Addresses" component={Addresses} />
                <Stack.Screen name="Search" component={Search} />
                <Stack.Screen name="AddNewAddress" component={AddNewAddress} />
                <Stack.Screen name="SearchAddress" component={SearchAddress} />
                <Stack.Screen name="OrderDetails" component={OrderDetails} />
                <Stack.Screen name="NoInternet" component={NoInternet} />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="LatestUpdates" component={LatestUpdates} />
                <Stack.Screen name="test" component={Test} />
            </Stack.Navigator>}
        </NavigationContainer>
    )
}

export default App;