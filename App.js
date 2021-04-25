import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native'

import { Home, Kitchens, Menu, KitchenDetails, Test } from './screens'
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
                <Stack.Screen name="test" component={Test} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App;