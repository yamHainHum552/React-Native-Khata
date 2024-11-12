import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import React from 'react';

const DrawerItems = ({icon, label, onPress, routeName, activeRouteName}) => {
  const isActive = activeRouteName === routeName; // Check if the route is active

  return (
    <TouchableOpacity onPress={onPress} style={styles.drawerItemContainer}>
      {/* Icon Container */}
      <View
        style={[
          styles.iconContainer,
          isActive && styles.activeIconContainer,
        ]}></View>
      {/* Label */}
      <Text
        style={[
          styles.drawerItemLabel,
          isActive && styles.activeDrawerItemLabel,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  drawerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#445E75',
  },
  iconContainer: {
    marginRight: 10,
  },
  activeIconContainer: {
    borderColor: '#76D7C4',
  },
  drawerItemLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 5,
  },
  activeDrawerItemLabel: {
    color: '#76D7C4',
    fontWeight: 'bold',
  },
});

export default DrawerItems;
