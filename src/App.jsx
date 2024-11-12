import 'react-native-gesture-handler';
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import Home from './screens/Home';
import {NavigationContainer} from '@react-navigation/native';
import Octicons from 'react-native-vector-icons/Octicons';
import DrawerItems from './components/DrawerItems';
import Company from './screens/Company';
import Firm from './screens/Firm';
import Welcome from './screens/Welcome';
import colors from './utils/colors';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0D1B2A',
          shadowColor: '#0D1B2A',
        },

        headerTitleAlign: 'center',
        headerTintColor: '#FFFFFF',
      }}>
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={({navigation}) => ({
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.toggleDrawer()}
              style={{marginLeft: 10}}>
              <Octicons name="three-bars" size={30} color="white" />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Company"
        component={Company}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="Firm"
        component={Firm}
        options={{headerShown: true}}
      />
    </Stack.Navigator>
  );
};

const CustomDrawerContent = props => {
  const {state, navigation} = props;
  const activeRouteIndex = state?.index;
  const activeRouteName = state?.routeNames[activeRouteIndex];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContentContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.headerText}>Khata</Text>
      </View>

      {/* Drawer Items */}
      <DrawerItems
        label={'Home'}
        onPress={() => navigation.navigate('Home')}
        routeName={'Home'}
        activeRouteName={activeRouteName}
      />

      {/* Additional Custom Content */}
      <View style={styles.customContent}>
        <Text style={styles.customContentText}>Please give us Feedback!!!</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false, // Remove this if you want to manage headers individually in Stack
        }}>
        <Drawer.Screen name="Home Screen" component={StackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContentContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  drawerHeader: {
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customContent: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  customContentText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default App;
