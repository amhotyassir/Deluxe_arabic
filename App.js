import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './context/AppContext';
import OrderEntryScreen from './screens/OrderEntryScreen';
import OrderListScreen from './screens/OrderListScreen';
import SettingsScreen from './screens/SettingsScreen';
import CostsScreen from './screens/CostsScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            "tabBarActiveTintColor": "tomato",
            "tabBarInactiveTintColor": "gray",
            "tabBarStyle": [
              {
                "display": "flex"
              },
              null
            ],
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'OrderEntry') {
                iconName = 'add-circle';
              } else if (route.name === 'OrderList') {
                iconName = 'list';
              } else if (route.name === 'Costs') {
                iconName = 'settings';
              } else if (route.name === 'Settings') {
                iconName = 'options';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="OrderEntry" component={OrderEntryScreen} options={{ title: 'إدخال الطلب' }} />
          <Tab.Screen name="OrderList" component={OrderListScreen} options={{ title: 'قائمة الطلبات' }} />
          <Tab.Screen name="Costs" component={CostsScreen} options={{ title: 'المصاريف' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
