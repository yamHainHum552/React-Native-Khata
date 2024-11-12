import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {fetchData} from '../utils';

const Welcome = ({navigation}) => {
  const opacity = useSharedValue(0);
  const buttonPosition = useSharedValue(100);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
    buttonPosition.value = withTiming(0, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: withTiming(opacity.value === 1 ? 0 : 10)}],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{translateY: buttonPosition.value}],
  }));

  const handleGetStarted = async () => {
    setIsFetching(true);
    await fetchData();
    setIsFetching(false);
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={styles.logoText}>Khata</Text>
      </Animated.View>
      <Animated.View style={[styles.welcomeTextContainer, textStyle]}>
        <Text style={styles.welcomeText}>Welcome to Khata!</Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>
            {isFetching ? (
              <ActivityIndicator color="white" size={25} />
            ) : (
              'Get Started'
            )}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0D1B2A',
  },
  welcomeTextContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    color: '#0D1B2A',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
  },
  getStartedButton: {
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Welcome;
