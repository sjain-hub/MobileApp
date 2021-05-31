import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native'

import { Home, Kitchens, Menu, KitchenDetails, VideoPlayer, Cart, Account, Profile, FavKitchens, Orders, Addresses, Search, Test } from './screens'
import Tabs from './navigation/tabs'

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
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
                <Stack.Screen name="test" component={Test} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App;