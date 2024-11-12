import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const CompanyList = ({company}) => {
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
  const categorySize = windowWidth / 1.5;

  return (
    <TouchableOpacity
      style={[styles.container, {width: categorySize, height: categorySize}]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Company', {company})}>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{company.registeredName}</Text>
        <Text style={styles.panText}>PAN: {company.panNumber}</Text>
        <AntDesign name="arrowright" color="white" size={30} />
      </View>
    </TouchableOpacity>
  );
};

export default CompanyList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1B2A',

    borderRadius: 10,
    padding: 15,
    marginVertical: 10,

    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 20,
    height: 200,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  textContainer: {
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  panText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});
